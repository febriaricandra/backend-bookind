import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import * as AttendanceService from '../services/attendance.service';


//type request

export const checkIn = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id; // From auth middleware
        const { notes } = req.body;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        
        const attendance = await AttendanceService.checkIn(userId, {
            notes
        });
        
        res.status(201).json({
            success: true,
            message: 'Check-in successful. Report will be generated asynchronously.',
            data: attendance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const checkOut = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { notes } = req.body;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        
        const attendance = await AttendanceService.checkOut(userId, {
            notes
        });
        
        res.status(200).json({
            success: true,
            message: 'Check-out successful. Report will be updated asynchronously.',
            data: attendance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getMyToday = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        
        const attendance = await AttendanceService.getMyAttendanceToday(userId);
        
        res.status(200).json({
            success: true,
            data: attendance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getMyHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { startDate, endDate } = req.query;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        
        const attendances = await AttendanceService.getMyAttendanceHistory(
            userId,
            startDate ? new Date(startDate as string) : undefined,
            endDate ? new Date(endDate as string) : undefined
        );
        
        res.status(200).json({
            success: true,
            data: attendances
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};