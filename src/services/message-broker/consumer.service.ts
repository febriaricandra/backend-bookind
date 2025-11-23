import { getRabbitMQChannel, QUEUES } from '../../config/rabbitmq.config';
import { AttendanceEvent } from '../../events/types/event.type';
import { handleAttendanceEvent } from '../../events/handlers/attendance.handler';

export const startAttendanceConsumer = async (): Promise<void> => {
    try {
        const channel = await getRabbitMQChannel();

        console.log('Starting attendance event consumer...');

        await channel.consume(
            QUEUES.ATTENDANCE_EVENTS,
            async (msg: any) => {
                if (msg) {
                    try {
                        const event: AttendanceEvent = JSON.parse(
                            msg.content.toString()
                        );
                        
                        console.log(`Received event: ${event.eventType} [${event.eventId}]`);
                        
                        // Process event
                        await handleAttendanceEvent(event);
                        
                        // Acknowledge message
                        channel.ack(msg);
                        
                        console.log(`Event processed: ${event.eventId}`);
                    } catch (error) {
                        console.error('Error processing message:', error);
                        console.error('Message content:', msg.content.toString());
                        
                        // Reject and requeue for retry (or move to DLQ if configured)
                        channel.nack(msg, false, true);
                    }
                }
            },
            { noAck: false }
        );

        console.log('Consumer started successfully');
    } catch (error) {
        console.error('Failed to start consumer:', error);
        throw error;
    }
};