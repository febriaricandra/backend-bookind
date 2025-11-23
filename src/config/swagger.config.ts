import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Attendance System API',
            version: '1.0.0',
            description: 'A comprehensive attendance management system API with message broker integration',
            contact: {
                name: 'API Support',
                email: 'support@attendance-system.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:3001/api',
                description: 'Development server',
            },
        ],
        tags: [
            {
                name: 'Authentication',
                description: 'User authentication and authorization endpoints',
            },
            {
                name: 'Attendance',
                description: 'Employee attendance management endpoints',
            },
            {
                name: 'Reports',
                description: 'Attendance reporting and analytics endpoints',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'User unique identifier',
                        },
                        name: {
                            type: 'string',
                            description: 'User full name',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address',
                        },
                        role: {
                            type: 'string',
                            enum: ['ADMIN', 'EMPLOYEE'],
                            description: 'User role in the system',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'User creation timestamp',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'User last update timestamp',
                        },
                    },
                },
                Attendance: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Attendance record unique identifier',
                        },
                        userId: {
                            type: 'string',
                            description: 'User ID who performed the attendance',
                        },
                        checkInTime: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Check-in timestamp',
                        },
                        checkOutTime: {
                            type: 'string',
                            format: 'date-time',
                            nullable: true,
                            description: 'Check-out timestamp (null if not checked out)',
                        },
                        checkInNotes: {
                            type: 'string',
                            nullable: true,
                            description: 'Optional notes for check-in',
                        },
                        checkOutNotes: {
                            type: 'string',
                            nullable: true,
                            description: 'Optional notes for check-out',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Record creation timestamp',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Record last update timestamp',
                        },
                    },
                },
                AttendanceReport: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Report unique identifier',
                        },
                        userId: {
                            type: 'string',
                            description: 'User ID',
                        },
                        date: {
                            type: 'string',
                            format: 'date',
                            description: 'Date of attendance',
                        },
                        checkInTime: {
                            type: 'string',
                            format: 'date-time',
                            nullable: true,
                            description: 'Check-in time',
                        },
                        checkOutTime: {
                            type: 'string',
                            format: 'date-time',
                            nullable: true,
                            description: 'Check-out time',
                        },
                        workDurationMinutes: {
                            type: 'integer',
                            nullable: true,
                            description: 'Work duration in minutes',
                        },
                        status: {
                            type: 'string',
                            enum: ['PRESENT', 'ABSENT', 'LATE'],
                            description: 'Attendance status',
                        },
                    },
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true,
                        },
                        message: {
                            type: 'string',
                            example: 'Login successful',
                        },
                        data: {
                            type: 'object',
                            properties: {
                                user: {
                                    $ref: '#/components/schemas/User',
                                },
                                token: {
                                    type: 'string',
                                    description: 'JWT access token',
                                },
                            },
                        },
                    },
                },
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true,
                        },
                        message: {
                            type: 'string',
                        },
                        data: {
                            type: 'object',
                            description: 'Response data (varies by endpoint)',
                        },
                    },
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        message: {
                            type: 'string',
                            description: 'Error message',
                        },
                        error: {
                            type: 'object',
                            description: 'Detailed error information',
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to the API files
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Attendance System API Documentation',
    }));
};

export default specs;
