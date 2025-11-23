import { getRabbitMQChannel, EXCHANGES, ROUTING_KEYS, isRabbitMQConnected } from '../../config/rabbitmq.config';
import { AttendanceEvent, AttendanceEventType } from '../../events/types/event.type';
import { v4 as uuidv4 } from 'uuid';

export const publishAttendanceEvent = async (event: AttendanceEvent): Promise<void> => {
    try {
        // Check if RabbitMQ is connected before attempting to publish
        if (!isRabbitMQConnected()) {
            console.warn('RabbitMQ not connected, skipping event publication');
            return;
        }

        const channel = await getRabbitMQChannel();
        
        // Add event ID if not exists
        if (!event.eventId) {
            event.eventId = uuidv4();
        }
        
        const routingKey = event.eventType === AttendanceEventType.CHECK_IN
            ? ROUTING_KEYS.CHECK_IN
            : ROUTING_KEYS.CHECK_OUT;
        console.log(event);
        const message = JSON.stringify(event);
        
        // Check if channel is still valid before publishing
        if (!channel || channel.closing || channel.closed) {
            console.warn('Channel is not available, skipping event publication');
            return;
        }
        
        const published = channel.publish(
            EXCHANGES.ATTENDANCE,
            routingKey,
            Buffer.from(message),
            {
                persistent: true,
                contentType: 'application/json',
                timestamp: Date.now()
            }
        );
        
        if (!published) {
            console.warn('Message was not published (queue is full), will retry later');
            return;
        }
        
        console.log(`Event published: ${event.eventType} for user ${event.data.userId}`);
    } catch (error) {
        console.error('Failed to publish event:', error);
        // Don't throw error to prevent breaking the main flow
        // The attendance should still be saved even if message broker fails
    }
};