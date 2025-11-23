import { Router } from "express";
import * as ReportController from "../controllers/report.controller";
import { authenticate, authorize } from "../middlewares/auth";

const ReportRoutes = Router();

// All routes require authentication
ReportRoutes.use(authenticate);

/**
 * @swagger
 * /reports/my-report:
 *   get:
 *     tags: [Reports]
 *     summary: Get my attendance reports
 *     description: Retrieve current user's detailed attendance reports with optional date filtering
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
 *         description: Attendance reports retrieved successfully
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
 *                         $ref: '#/components/schemas/AttendanceReport'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
ReportRoutes.get("/my-report", ReportController.getMyReport);

/**
 * @swagger
 * /reports/my-summary:
 *   get:
 *     tags: [Reports]
 *     summary: Get my attendance summary
 *     description: Retrieve current user's attendance summary for a specific month/year
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Month (1-12)
 *         example: 11
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           minimum: 2020
 *         description: Year
 *         example: 2025
 *     responses:
 *       200:
 *         description: Attendance summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalDays:
 *                           type: integer
 *                           description: Total working days in the period
 *                         presentDays:
 *                           type: integer
 *                           description: Number of days present
 *                         absentDays:
 *                           type: integer
 *                           description: Number of days absent
 *                         lateDays:
 *                           type: integer
 *                           description: Number of days late
 *                         totalWorkHours:
 *                           type: number
 *                           description: Total work hours in the period
 *                         averageWorkHours:
 *                           type: number
 *                           description: Average work hours per day
 *                         attendanceRate:
 *                           type: number
 *                           description: Attendance rate percentage
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
ReportRoutes.get("/my-summary", ReportController.getMySummary);

/**
 * @swagger
 * /reports:
 *   get:
 *     tags: [Reports]
 *     summary: Get all users' reports (Admin only)
 *     description: Retrieve attendance reports for all users (Admin access required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by specific user ID
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PRESENT, ABSENT, LATE]
 *         description: Filter by attendance status
 *     responses:
 *       200:
 *         description: Reports retrieved successfully
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
 *                         allOf:
 *                           - $ref: '#/components/schemas/AttendanceReport'
 *                           - type: object
 *                             properties:
 *                               user:
 *                                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
ReportRoutes.get("/", authorize(["ADMIN"]), ReportController.getReports);

export default ReportRoutes;