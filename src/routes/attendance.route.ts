import { Router } from "express";
import * as AttendanceController from "../controllers/attendance.controller";
import { authenticate } from "../middlewares/auth";

const AttendanceRoutes = Router();

// All routes require authentication
AttendanceRoutes.use(authenticate);

/**
 * @swagger
 * /attendance/checkin:
 *   post:
 *     tags: [Attendance]
 *     summary: Check in to work
 *     description: Record employee check-in time and optional notes
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 example: "Starting work for the day"
 *     responses:
 *       201:
 *         description: Check-in successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Attendance'
 *       400:
 *         description: Already checked in today
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
AttendanceRoutes.post("/checkin", AttendanceController.checkIn);

/**
 * @swagger
 * /attendance/checkout:
 *   post:
 *     tags: [Attendance]
 *     summary: Check out from work
 *     description: Record employee check-out time and optional notes
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 example: "Finished work for the day"
 *     responses:
 *       200:
 *         description: Check-out successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Attendance'
 *       400:
 *         description: No active check-in found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
AttendanceRoutes.post("/checkout", AttendanceController.checkOut);

/**
 * @swagger
 * /attendance/today:
 *   get:
 *     tags: [Attendance]
 *     summary: Get today's attendance
 *     description: Retrieve the current user's attendance record for today
 *     responses:
 *       200:
 *         description: Today's attendance record
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       oneOf:
 *                         - $ref: '#/components/schemas/Attendance'
 *                         - type: null
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
AttendanceRoutes.get("/today", AttendanceController.getMyToday);

/**
 * @swagger
 * /attendance/history:
 *   get:
 *     tags: [Attendance]
 *     summary: Get attendance history
 *     description: Retrieve the current user's attendance history with optional date filtering
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering (YYYY-MM-DD)
 *         example: "2025-11-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering (YYYY-MM-DD)
 *         example: "2025-11-30"
 *     responses:
 *       200:
 *         description: Attendance history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Attendance'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
AttendanceRoutes.get("/history", AttendanceController.getMyHistory);

export default AttendanceRoutes;