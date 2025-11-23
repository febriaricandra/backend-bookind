import { prisma } from '../index';
import { createError } from '../middlewares/errorHandler';
import { publishAttendanceEvent } from './message-broker/producer.service';
import { AttendanceEvent, AttendanceEventType } from '../events/types/event.type';
import { v4 as uuidv4 } from 'uuid';

interface CheckInData {
    notes?: string;
}

interface CheckOutData {
    notes?: string;
}

export const checkIn = async (userId: string, data: CheckInData) => {
    try {
        // Get user info
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true
            }
        });
        
        if (!user) {
            throw createError('User not found', 404);
        }
        
        // Check if already checked in today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const existingAttendance = await prisma.attendance.findFirst({
            where: {
                userId,
                checkInTime: {
                    gte: today
                }
            }
        });
        
        if (existingAttendance) {
            throw createError('Already checked in today', 400);
        }
        
        // Create attendance record
        const attendance = await prisma.attendance.create({
            data: {
                userId,
                checkInTime: new Date(),
                checkInNotes: data.notes,
            }
        });
        
        // Publish event to message broker (non-blocking)
        // Fire and forget - don't let message broker failure affect attendance
        setImmediate(async () => {
            try {
                const event: AttendanceEvent = {
                    eventId: uuidv4(),
                    eventType: AttendanceEventType.CHECK_IN,
                    timestamp: new Date(),
                    data: {
                        attendanceId: attendance.id,
                        userId: user.id,
                        userName: user.name,
                        checkInTime: attendance.checkInTime!,
                    }
                };
                
                await publishAttendanceEvent(event);
            } catch (error) {
                console.error('Failed to publish check-in event:', error);
                // Event publication failed but attendance is already saved
            }
        });
        
        return attendance;
    } catch (error) {
        throw error;
    }
};

export const checkOut = async (userId: string, data: CheckOutData) => {
    try {
        // Get user info
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true
            }
        });
        
        if (!user) {
            throw createError('User not found', 404);
        }
        
        // Find today's check-in
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const attendance = await prisma.attendance.findFirst({
            where: {
                userId,
                checkInTime: {
                    gte: today
                },
                checkOutTime: null
            }
        });
        
        if (!attendance) {
            throw createError('No active check-in found', 400);
        }
        
        // Update attendance record
        const updatedAttendance = await prisma.attendance.update({
            where: { id: attendance.id },
            data: {
                checkOutTime: new Date(),
                checkOutNotes: data.notes,
            }
        });
        
        // Publish event to message broker (non-blocking)
        // Fire and forget - don't let message broker failure affect attendance
        setImmediate(async () => {
            try {
                const event: AttendanceEvent = {
                    eventId: uuidv4(),
                    eventType: AttendanceEventType.CHECK_OUT,
                    timestamp: new Date(),
                    data: {
                        attendanceId: updatedAttendance.id,
                        userId: user.id,
                        userName: user.name,
                        checkOutTime: updatedAttendance.checkOutTime!,
                    }
                };
                
                await publishAttendanceEvent(event);
            } catch (error) {
                console.error('Failed to publish check-out event:', error);
                // Event publication failed but attendance is already saved
            }
        });
        
        return updatedAttendance;
    } catch (error) {
        throw error;
    }
};

export const getMyAttendanceToday = async (userId: string) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const attendance = await prisma.attendance.findFirst({
            where: {
                userId,
                checkInTime: {
                    gte: today
                }
            }
        });
        
        return attendance;
    } catch (error) {
        throw error;
    }
};

export const getMyAttendanceHistory = async (
    userId: string,
    startDate?: Date,
    endDate?: Date
) => {
    try {
        const whereClause: any = { userId };
        
        if (startDate || endDate) {
            whereClause.checkInTime = {};
            if (startDate) whereClause.checkInTime.gte = startDate;
            if (endDate) whereClause.checkInTime.lte = endDate;
        }
        
        const attendances = await prisma.attendance.findMany({
            where: whereClause,
            orderBy: {
                checkInTime: 'desc'
            }
        });
        
        return attendances;
    } catch (error) {
        throw error;
    }
};