import { prisma } from '../index';
import { createError } from '../middlewares/errorHandler';

interface GetReportsFilter {
    userId?: string;
    startDate?: Date;
    endDate?: Date;
}

export const getAttendanceReports = async (filters: GetReportsFilter) => {
    try {
        const whereClause: any = {};
        
        if (filters.userId) {
            whereClause.userId = filters.userId;
        }
        
        if (filters.startDate || filters.endDate) {
            whereClause.date = {};
            if (filters.startDate) whereClause.date.gte = filters.startDate;
            if (filters.endDate) whereClause.date.lte = filters.endDate;
        }
        
        const reports = await (prisma as any).attendanceReport.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });
        
        return reports;
    } catch (error) {
        throw error;
    }
};

export const getMyAttendanceReport = async (userId: string, month?: number, year?: number) => {
    try {
        const whereClause: any = { userId };
        
        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            
            whereClause.date = {
                gte: startDate,
                lte: endDate
            };
        }

        const reports = await (prisma as any).attendanceReport.findMany({
            where: whereClause,
            orderBy: {
                date: 'desc'
            }
        });
        
        return reports;
    } catch (error) {
        throw error;
    }
};

export const generateMonthlySummary = async (userId: string, month: number, year: number) => {
    try {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const reports = await (prisma as any).attendanceReport.findMany({
            where: {
                userId,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });
        
        const summary = {
            totalDays: reports.length,
            presentDays: reports.filter((r: any) => r.status === 'PRESENT').length,
            absentDays: reports.filter((r: any) => r.status === 'ABSENT').length,
            lateDays: reports.filter((r: any) => r.status === 'LATE').length,
            leaveDays: reports.filter((r: any) => r.status === 'LEAVE').length,
            totalWorkMinutes: reports.reduce((sum: number, r: any) => sum + (r.workDurationMinutes || 0), 0),
            averageWorkMinutes: reports.length > 0
                ? Math.round(reports.reduce((sum: number, r: any) => sum + (r.workDurationMinutes || 0), 0) / reports.length)
                : 0
        };
        
        return summary;
    } catch (error) {
        throw error;
    }
};