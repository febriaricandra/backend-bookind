import { prisma } from '../../index';
import { AttendanceEvent, AttendanceEventType } from '../types/event.type';

const handleCheckIn = async (event: AttendanceEvent): Promise<void> => {
    try {
        const date = new Date(event.data.checkInTime!);
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        await (prisma as any).attendanceReport.upsert({
            where: {
                userId_date: {
                    userId: event.data.userId,
                    date: dateOnly
                }
            },
            update: {
                checkInTime: event.data.checkInTime,
                status: 'PRESENT',
                updatedAt: new Date()
            },
            create: {
                userId: event.data.userId,
                date: dateOnly,
                checkInTime: event.data.checkInTime,
                status: 'PRESENT'
            }
        });
        
        console.log(`Check-in report updated for user ${event.data.userId}`);
    } catch (error) {
        console.error('Error handling check-in event:', error);
        throw error;
    }
};

const handleCheckOut = async (event: AttendanceEvent): Promise<void> => {
    try {
        const date = new Date(event.data.checkOutTime!);
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        // Find existing report
        const report = await (prisma as any).attendanceReport.findUnique({
            where: {
                userId_date: {
                    userId: event.data.userId,
                    date: dateOnly
                }
            }
        });
        
        if (!report) {
            console.warn(`No check-in found for user ${event.data.userId} on ${dateOnly}`);
            return;
        }
        
        // Calculate work duration
        const checkInTime = new Date(report.checkInTime);
        const checkOutTime = new Date(event.data.checkOutTime!);
        const workDurationMinutes = Math.floor(
            (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60)
        );
        
        await (prisma as any).attendanceReport.update({
            where: {
                userId_date: {
                    userId: event.data.userId,
                    date: dateOnly
                }
            },
            data: {
                checkOutTime: event.data.checkOutTime,
                workDurationMinutes,
                updatedAt: new Date()
            }
        });

        console.log(`Check-out report updated for user ${event.data.userId}`);
    } catch (error) {
        console.error('Error handling check-out event:', error);
        throw error;
    }
};

export const handleAttendanceEvent = async (event: AttendanceEvent): Promise<void> => {
    switch (event.eventType) {
        case AttendanceEventType.CHECK_IN:
            await handleCheckIn(event);
            break;
        case AttendanceEventType.CHECK_OUT:
            await handleCheckOut(event);
            break;
        default:
            console.warn(`Unknown event type: ${event.eventType}`);
    }
};