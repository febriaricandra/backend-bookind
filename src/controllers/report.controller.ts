import { Request, Response, NextFunction } from 'express';
import * as ReportService from '../services/report.service';

export const getReports = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, startDate, endDate } = req.query;
        
        const reports = await ReportService.getAttendanceReports({
            userId: userId as string,
            startDate: startDate ? new Date(startDate as string) : undefined,
            endDate: endDate ? new Date(endDate as string) : undefined
        });
        
        res.status(200).json({
            success: true,
            data: reports
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getMyReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { month, year } = req.query;
        
        const reports = await ReportService.getMyAttendanceReport(
            userId,
            month ? parseInt(month as string) : undefined,
            year ? parseInt(year as string) : undefined
        );
        
        res.status(200).json({
            success: true,
            data: reports
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getMySummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { month, year } = req.query;
        
        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: 'Month and year are required'
            });
        }
        
        const summary = await ReportService.generateMonthlySummary(
            userId,
            parseInt(month as string),
            parseInt(year as string)
        );
        
        res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};