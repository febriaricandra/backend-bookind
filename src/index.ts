import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { createClient } from 'redis';
import { logger } from './utils/logger';
import helmet from 'helmet';
import router from './routes/index';
import { connectRabbitMQ, closeRabbitMQ } from './config/rabbitmq.config';
import { startAttendanceConsumer } from './services/message-broker/consumer.service';
import { setupSwagger } from './config/swagger.config';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

export const prisma = new PrismaClient();
export const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

async function startServer() {
    // Connect to Redis
    await redisClient.connect();
    logger.info('Connected to Redis');

    // Connect to RabbitMQ
    try {
        await connectRabbitMQ();
        logger.info('Connected to RabbitMQ');
        
        // Start consumers
        await startAttendanceConsumer();
        logger.info('RabbitMQ consumers started');
    } catch (error) {
        logger.error('Failed to connect to RabbitMQ:', error);
        process.exit(1);
    }

    // Middleware
    app.use(cors());
    app.use(helmet());
    app.use(morgan('combined'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Setup Swagger documentation
    setupSwagger(app);

    app.get('/health', (req, res) => {
        res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    app.use('/api', router);

    // 404 Handler
    app.use((req, res) => {
        res.status(404).json({ error: 'Not Found' });
    });

    // Start Express server
    app.listen(PORT, () => {
        logger.info(`Server is running on http://localhost:${PORT}`);
    });
}

process.on('SIGINT', async () => {
    await prisma.$disconnect();
    await redisClient.quit();
    await closeRabbitMQ();
    logger.info('All connections closed');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    await redisClient.quit();
    await closeRabbitMQ();
    logger.info('All connections closed');
    process.exit(0);
});

startServer();
