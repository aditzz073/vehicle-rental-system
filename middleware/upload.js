const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Simple in-memory rate limiting for uploads (in production, use Redis)
const uploadRateLimit = new Map();

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_UPLOADS_PER_WINDOW = 20; // Maximum uploads per window per IP

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../public/uploads/vehicles');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'vehicle-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Enhanced file filter for images with additional security checks
const fileFilter = (req, file, cb) => {
    try {
        // Check if file is an image by MIME type
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        
        // Allowed image MIME types (whitelist approach)
        const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/gif',
            'image/webp'
        ];
        
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error('Unsupported image format. Only JPEG, PNG, GIF, and WebP are allowed!'), false);
        }
        
        // Check file extension (additional security layer)
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        
        if (!allowedExtensions.includes(fileExtension)) {
            return cb(new Error('Invalid file extension!'), false);
        }
        
        // Check for suspicious filenames
        if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
            return cb(new Error('Invalid filename!'), false);
        }
        
        cb(null, true);
    } catch (error) {
        cb(new Error('File validation failed!'), false);
    }
};

// Configure multer with enhanced security limits
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
        files: 5, // Maximum 5 files per upload
        fields: 10, // Maximum number of non-file fields
        fieldNameSize: 100, // Maximum field name size in bytes
        fieldSize: 1024 * 1024, // Maximum field value size (1MB)
        parts: 20, // Maximum number of parts (fields + files)
        headerPairs: 2000 // Maximum number of header key-value pairs
    },
    fileFilter: fileFilter,
    preservePath: false // Prevent directory traversal attacks
});

// Rate limiting function
const checkRateLimit = (req) => {
    const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const now = Date.now();
    
    if (!uploadRateLimit.has(clientIp)) {
        uploadRateLimit.set(clientIp, { count: 1, firstUpload: now });
        return true;
    }
    
    const clientData = uploadRateLimit.get(clientIp);
    
    // Reset window if expired
    if (now - clientData.firstUpload > RATE_LIMIT_WINDOW) {
        uploadRateLimit.set(clientIp, { count: 1, firstUpload: now });
        return true;
    }
    
    // Check if limit exceeded
    if (clientData.count >= MAX_UPLOADS_PER_WINDOW) {
        return false;
    }
    
    // Increment count
    clientData.count++;
    return true;
};

// Middleware for single file upload with error handling and rate limiting
const uploadSingle = (req, res, next) => {
    // Check rate limit first
    if (!checkRateLimit(req)) {
        return res.status(429).json({
            success: false,
            message: 'Too many upload requests. Please try again later.',
            error_code: 'RATE_LIMIT_EXCEEDED'
        });
    }
    
    upload.single('image')(req, res, (err) => {
        if (err) {
            return handleUploadError(err, req, res, next);
        }
        next();
    });
};

// Middleware for multiple file upload with error handling and rate limiting
const uploadMultiple = (req, res, next) => {
    // Check rate limit first
    if (!checkRateLimit(req)) {
        return res.status(429).json({
            success: false,
            message: 'Too many upload requests. Please try again later.',
            error_code: 'RATE_LIMIT_EXCEEDED'
        });
    }
    
    upload.array('images', 5)(req, res, (err) => {
        if (err) {
            return handleUploadError(err, req, res, next);
        }
        next();
    });
};

// Enhanced error handling middleware with comprehensive coverage
const handleUploadError = (error, req, res, next) => {
    // Log the error for monitoring
    console.error('Upload error:', error);
    
    // Handle Multer-specific errors
    if (error instanceof multer.MulterError) {
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    success: false,
                    message: 'File size too large. Maximum size is 5MB.',
                    error_code: 'FILE_TOO_LARGE'
                });
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    success: false,
                    message: 'Too many files. Maximum 5 files allowed.',
                    error_code: 'TOO_MANY_FILES'
                });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({
                    success: false,
                    message: 'Unexpected field name for file upload.',
                    error_code: 'UNEXPECTED_FIELD'
                });
            case 'LIMIT_PART_COUNT':
                return res.status(400).json({
                    success: false,
                    message: 'Too many parts in the request.',
                    error_code: 'TOO_MANY_PARTS'
                });
            case 'LIMIT_FIELD_KEY':
                return res.status(400).json({
                    success: false,
                    message: 'Field name too long.',
                    error_code: 'FIELD_NAME_TOO_LONG'
                });
            case 'LIMIT_FIELD_VALUE':
                return res.status(400).json({
                    success: false,
                    message: 'Field value too long.',
                    error_code: 'FIELD_VALUE_TOO_LONG'
                });
            case 'LIMIT_FIELD_COUNT':
                return res.status(400).json({
                    success: false,
                    message: 'Too many fields in the request.',
                    error_code: 'TOO_MANY_FIELDS'
                });
            default:
                return res.status(400).json({
                    success: false,
                    message: 'File upload error occurred.',
                    error_code: 'UPLOAD_ERROR'
                });
        }
    }
    
    // Handle custom file filter errors
    if (error.message === 'Only image files are allowed!') {
        return res.status(400).json({
            success: false,
            message: 'Only image files are allowed.',
            error_code: 'INVALID_FILE_TYPE'
        });
    }
    
    if (error.message === 'Unsupported image format. Only JPEG, PNG, GIF, and WebP are allowed!') {
        return res.status(400).json({
            success: false,
            message: 'Unsupported image format. Only JPEG, PNG, GIF, and WebP are allowed.',
            error_code: 'UNSUPPORTED_FORMAT'
        });
    }
    
    if (error.message === 'Invalid file extension!') {
        return res.status(400).json({
            success: false,
            message: 'Invalid file extension.',
            error_code: 'INVALID_EXTENSION'
        });
    }
    
    if (error.message === 'Invalid filename!') {
        return res.status(400).json({
            success: false,
            message: 'Invalid filename detected.',
            error_code: 'INVALID_FILENAME'
        });
    }
    
    if (error.message === 'File validation failed!') {
        return res.status(400).json({
            success: false,
            message: 'File validation failed.',
            error_code: 'VALIDATION_FAILED'
        });
    }
    
    // Handle other upload-related errors
    if (error.message && error.message.includes('ENOENT')) {
        return res.status(500).json({
            success: false,
            message: 'Upload directory not accessible.',
            error_code: 'DIRECTORY_ERROR'
        });
    }
    
    if (error.message && error.message.includes('ENOSPC')) {
        return res.status(507).json({
            success: false,
            message: 'Insufficient storage space.',
            error_code: 'STORAGE_FULL'
        });
    }
    
    // Default error response for unhandled errors
    return res.status(500).json({
        success: false,
        message: 'An unexpected error occurred during file upload.',
        error_code: 'INTERNAL_ERROR'
    });
};

// Utility function to delete uploaded files safely
const deleteFile = (filename) => {
    try {
        const filePath = path.join(uploadDir, filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
};

// Utility function to get file URL
const getFileUrl = (req, filename) => {
    return `${req.protocol}://${req.get('host')}/uploads/vehicles/${filename}`;
};

// Cleanup function for rate limiting map (call periodically)
const cleanupRateLimit = () => {
    const now = Date.now();
    for (const [ip, data] of uploadRateLimit.entries()) {
        if (now - data.firstUpload > RATE_LIMIT_WINDOW) {
            uploadRateLimit.delete(ip);
        }
    }
};

// Schedule cleanup every 5 minutes
setInterval(cleanupRateLimit, 5 * 60 * 1000);

module.exports = {
    uploadSingle,
    uploadMultiple,
    handleUploadError,
    deleteFile,
    getFileUrl
};
