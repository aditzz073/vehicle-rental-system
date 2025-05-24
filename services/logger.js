const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Create the logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'autohive-backend' },
    transports: [
        // Write all logs with level 'error' and below to error.log
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Write all logs with level 'info' and below to combined.log
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 10,
        }),
        // Write all logs to access.log for request logging
        new winston.transports.File({
            filename: path.join(logDir, 'access.log'),
            level: 'http',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        })
    ],
});

// If we're not in production, log to the console as well
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

// Express request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    // Log request
    logger.http('Request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.session?.userId || 'anonymous'
    });
    
    // Log response when finished
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.http('Response', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userId: req.session?.userId || 'anonymous'
        });
    });
    
    next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
    logger.error('Application Error', {
        error: {
            message: err.message,
            stack: err.stack,
            name: err.name
        },
        request: {
            method: req.method,
            url: req.url,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            userId: req.session?.userId || 'anonymous'
        }
    });
    
    next(err);
};

// Database operation logger
const dbLogger = {
    query: (sql, params, duration) => {
        logger.debug('Database Query', {
            sql: sql.substring(0, 500), // Limit SQL length in logs
            params: params,
            duration: `${duration}ms`
        });
    },
    
    error: (error, sql, params) => {
        logger.error('Database Error', {
            error: {
                message: error.message,
                code: error.code,
                errno: error.errno
            },
            sql: sql?.substring(0, 500),
            params: params
        });
    }
};

// Authentication logger
const authLogger = {
    login: (userId, email, ip) => {
        logger.info('User Login', {
            userId,
            email,
            ip,
            event: 'login_success'
        });
    },
    
    loginFailed: (email, ip, reason) => {
        logger.warn('Login Failed', {
            email,
            ip,
            reason,
            event: 'login_failed'
        });
    },
    
    logout: (userId, email, ip) => {
        logger.info('User Logout', {
            userId,
            email,
            ip,
            event: 'logout'
        });
    },
    
    passwordReset: (email, ip) => {
        logger.info('Password Reset Request', {
            email,
            ip,
            event: 'password_reset_request'
        });
    }
};

// Booking logger
const bookingLogger = {
    created: (bookingId, userId, vehicleId, totalCost) => {
        logger.info('Booking Created', {
            bookingId,
            userId,
            vehicleId,
            totalCost,
            event: 'booking_created'
        });
    },
    
    cancelled: (bookingId, userId, reason) => {
        logger.info('Booking Cancelled', {
            bookingId,
            userId,
            reason,
            event: 'booking_cancelled'
        });
    },
    
    completed: (bookingId, userId) => {
        logger.info('Booking Completed', {
            bookingId,
            userId,
            event: 'booking_completed'
        });
    }
};

// Payment logger
const paymentLogger = {
    processed: (paymentId, bookingId, amount, method) => {
        logger.info('Payment Processed', {
            paymentId,
            bookingId,
            amount,
            method,
            event: 'payment_processed'
        });
    },
    
    failed: (bookingId, amount, reason) => {
        logger.warn('Payment Failed', {
            bookingId,
            amount,
            reason,
            event: 'payment_failed'
        });
    },
    
    refunded: (paymentId, amount, reason) => {
        logger.info('Payment Refunded', {
            paymentId,
            amount,
            reason,
            event: 'payment_refunded'
        });
    }
};

module.exports = {
    logger,
    requestLogger,
    errorLogger,
    dbLogger,
    authLogger,
    bookingLogger,
    paymentLogger
};
