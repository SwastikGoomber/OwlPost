require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/userRoutes');
const emailRoutes = require('./routes/emailRoutes');

const app = express();

// CORS configuration
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
    if (process.env.DEBUG === 'true') {
        console.log('\n=== Incoming Request ===');
        console.log('URL:', req.url);
        console.log('Method:', req.method);
        console.log('Headers:', req.headers);
        if (req.body && !req.body.password) {
            console.log('Body:', req.body);
        }
    }
    next();
});

// Connect to MongoDB
mongoose.set('debug', process.env.DEBUG === 'true');
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Test route
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API is working',
        emailConfig: {
            host: process.env.EMAIL_HOST,
            smtpPort: process.env.EMAIL_PORT_SMTP,
            imapPort: process.env.EMAIL_PORT_IMAP,
            useTLS: process.env.EMAIL_USE_TLS
        }
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    console.log('404 Not Found:', req.method, req.url);
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n=== Server Configuration ===`);
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Debug mode: ${process.env.DEBUG}`);
    console.log(`\nEmail Configuration:`);
    console.log(`Host: ${process.env.EMAIL_HOST}`);
    console.log(`SMTP Port: ${process.env.EMAIL_PORT_SMTP}`);
    console.log(`IMAP Port: ${process.env.EMAIL_PORT_IMAP}`);
    console.log(`Use TLS: ${process.env.EMAIL_USE_TLS}`);
    console.log(`\nAvailable routes:`);
    console.log('POST /api/auth/register');
    console.log('POST /api/auth/login');
    console.log('GET /api/auth/profile');
    console.log('GET /api/emails');
    console.log('POST /api/emails');
    console.log('GET /api/emails/folders');
    console.log('GET /api/test (for testing API connection)\n');
});
