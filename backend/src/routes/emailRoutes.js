const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');

// Test route for email connection
router.get('/test-connection', auth, async (req, res) => {
    try {
        const user = req.user;
        console.log('Testing email connection for:', user.email);

        // Test SMTP connection
        const transport = nodemailer.createTransport({
            host: 'mail.sileistar.me',
            port: 465,
            secure: true,
            auth: {
                user: user.email,
                pass: 'powtayt0h-'  // Using the known working password
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Verify SMTP connection
        await transport.verify();
        console.log('SMTP connection successful');

        // Test IMAP connection
        const Imap = require('imap');
        const imap = new Imap({
            user: user.email,
            password: 'powtayt0h-',  // Using the known working password
            host: 'mail.sileistar.me',
            port: 993,
            tls: true,
            tlsOptions: { rejectUnauthorized: false }
        });

        await new Promise((resolve, reject) => {
            imap.once('ready', () => {
                console.log('IMAP connection successful');
                imap.end();
                resolve();
            });
            imap.once('error', (err) => {
                reject(err);
            });
            imap.connect();
        });

        res.json({ 
            message: 'Email connections successful',
            smtp: true,
            imap: true
        });
    } catch (error) {
        console.error('Email connection test failed:', error);
        res.status(500).json({
            message: 'Email connection test failed',
            error: error.message,
            smtp: false,
            imap: false
        });
    }
});

// Regular email routes
router.use(auth);
router.get('/', emailController.getEmails);
router.post('/', emailController.sendEmail);
router.get('/folders', emailController.getFolders);

module.exports = router;
