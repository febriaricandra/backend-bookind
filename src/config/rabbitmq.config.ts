import amqp from 'amqplib';

// Global state
let connection: any = null;
let channel: any = null;
let isConnecting = false;

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

// Queue names
export const QUEUES = {
    ATTENDANCE_EVENTS: 'attendance.events',
    REPORT_UPDATES: 'report.updates'
};

// Exchange names
export const EXCHANGES = {
    ATTENDANCE: 'attendance.exchange'
};

// Routing keys
export const ROUTING_KEYS = {
    CHECK_IN: 'attendance.checkin',
    CHECK_OUT: 'attendance.checkout'
};

export async function connectRabbitMQ(): Promise<void> {
    if (isConnecting) {
        console.log('Already connecting to RabbitMQ...');
        return;
    }

    try {
        isConnecting = true;
        
        connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        
        // Handle connection events
        connection.on('error', (err: any) => {
            console.error('RabbitMQ connection error:', err);
            connection = null;
            channel = null;
        });

        connection.on('close', () => {
            console.log('RabbitMQ connection closed');
            connection = null;
            channel = null;
        });

        // Handle channel events
        channel.on('error', (err: any) => {
            console.error('RabbitMQ channel error:', err);
            channel = null;
        });

        channel.on('close', () => {
            console.log('RabbitMQ channel closed');
            channel = null;
        });
        
        // Create exchange
        await channel.assertExchange(
            EXCHANGES.ATTENDANCE,
            'topic',
            { durable: true }
        );
        
        // Create queues
        await channel.assertQueue(QUEUES.ATTENDANCE_EVENTS, {
            durable: true
        });
        
        await channel.assertQueue(QUEUES.REPORT_UPDATES, {
            durable: true
        });
        
        // Bind queues to exchange
        await channel.bindQueue(
            QUEUES.ATTENDANCE_EVENTS,
            EXCHANGES.ATTENDANCE,
            'attendance.*'
        );
        
        console.log('RabbitMQ connected successfully');
    } catch (error) {
        console.error('RabbitMQ connection failed:', error);
        connection = null;
        channel = null;
        throw error;
    } finally {
        isConnecting = false;
    }
}

export async function getRabbitMQChannel(): Promise<any> {
    if (!channel || !connection || channel.closing || channel.closed) {
        console.log('Reconnecting to RabbitMQ...');
        try {
            await connectRabbitMQ();
            if (!channel) {
                throw new Error('Failed to reconnect to RabbitMQ');
            }
        } catch (error) {
            console.error('Failed to reconnect to RabbitMQ:', error);
            throw error;
        }
    }
    return channel;
}

export function isRabbitMQConnected(): boolean {
    return connection !== null && 
           channel !== null && 
           !channel.closing && 
           !channel.closed;
}

export async function closeRabbitMQ(): Promise<void> {
    try {
        if (channel) {
            await channel.close();
            channel = null;
        }
        if (connection) {
            await connection.close();
            connection = null;
        }
    } catch (error) {
        console.error('Error closing RabbitMQ connection:', error);
    }
}