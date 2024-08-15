const express = require('express');
const morgan = require('morgan');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const ShortUrl = require('./models/shortUrl');
const mongoose = require('mongoose');
require('dotenv').config();
const createError = require('http-errors');
const authRoutes = require('./routes/authRoutes');
const urlRoutes = require('./routes/urlRoutes');
const rateLimiter = require('./middlewares/rateLimiter');
const verifyToken = require('./middlewares/authMiddleware');
const { initializeRedisClient, redisCachingMiddleware, redisClient } = require('./helpers/redis');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require("swagger-jsdoc")

async function initializeExpressServer() {
    try {
        const app = express();

        module.exports = app;

        // Connect to MongoDB and initialize Redis
        await connectDB();
        await initializeRedisClient();

        // Middleware setup
        app.use(morgan('dev'));
        app.use(express.json());
        app.use(cookieParser());
        app.use(rateLimiter);
        app.set('view engine', 'ejs');
        app.use(express.urlencoded({ extended: false }));

        const PORT = process.env.PORT || 8080;

        // Define routes
        app.use('/auth', authRoutes);
        app.use('/urls', verifyToken, urlRoutes);

        const swaggerOptions = {
            swaggerDefinition: {
                openapi: '3.0.0',
                info: {
                    version: '1.0.0',
                    title: 'Scissors URL shortener API ',
                    description: 'API documentation for the URL Shortener service',
                    contact: {
                        name: 'Olajide',
                    },
                    servers: ['http://localhost:3000']
                },
                schemes: ['http', 'https'],
            },
            apis: ['./routes/*.js']
        }

        const swaggerDocs = swaggerJsDoc(swaggerOptions)
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

        app.get('/', (req, res) => {
            res.render('index');
        });

        // Handle short URL redirects
        app.get('/:shortUrl', redisCachingMiddleware(), async (req, res, next) => {
            try {
                const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
                if (!shortUrl) return res.sendStatus(404);

                shortUrl.clicks++;
                await shortUrl.save();

                res.redirect(shortUrl.full);
            } catch (err) {
                next(err);
            }
        });

        // Error handler
        app.use((err, req, res, next) => {
            res.status(err.status || 500);
            res.send({
                error: {
                    status: err.status || 500,
                    message: err.message,
                },
            });
        });

        // Start the server
        if (require.main === module) {
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        }
    } catch (e) {
        console.error('Error during server initialization:', e);
        process.exit(1);
    }
}

initializeExpressServer();


    process.on('SIGINT', async () => {
        try {
            await mongoose.connection.close();
            if (redisClient && redisClient.isOpen) {
                await redisClient.quit();
            }
            process.exit(0);
        } catch (error) {
            console.error('Error during shutdown:', error);
            process.exit(1);
        }
    });
