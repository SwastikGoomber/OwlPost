const nodemailer = require('nodemailer');

// Helper function to create SMTP transport
const createSmtpTransport = (user) => {
    console.log('\n=== Creating SMTP Transport ===');
    console.log('User:', user.email);

    const config = {
        host: 'mail.sileistar.me',
        port: 465,  // Back to port 465 with SSL
        secure: true,
        auth: {
            user: user.email,
            pass: 'powtayt0h-'  // Mailu password
        },
        tls: {
            rejectUnauthorized: false,
            minVersion: 'TLSv1'
        },
        debug: true,
        logger: true
    };

    console.log('SMTP Config:', {
        ...config,
        auth: {
            ...config.auth,
            pass: '[REDACTED]'
        }
    });

    return nodemailer.createTransport(config);
};

exports.sendEmail = async (req, res) => {
    let transport = null;
    try {
        const { to, subject, text } = req.body;
        const user = req.user;

        console.log('\n=== Sending Email ===');
        console.log('From:', user.email);
        console.log('To:', to);
        console.log('Subject:', subject);

        transport = createSmtpTransport(user);

        // Test connection first
        console.log('\nVerifying SMTP connection...');
        try {
            await transport.verify();
            console.log('✓ SMTP connection verified');
        } catch (verifyError) {
            console.error('SMTP verification failed:', {
                error: verifyError.message,
                code: verifyError.code,
                command: verifyError.command,
                response: verifyError.response
            });
            throw verifyError;
        }

        // Send email
        console.log('\nSending email...');
        const info = await transport.sendMail({
            from: {
                name: user.name || user.email.split('@')[0],
                address: user.email
            },
            to: {
                address: to
            },
            subject,
            text,
            date: new Date(),
            messageId: `<${Date.now()}@sileistar.me>`,
            headers: {
                'X-Mailer': 'OwlPost',
                'X-Priority': '1'
            }
        });

        console.log('\n=== Email Sent ===');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
        console.log('Envelope:', info.envelope);
        console.log('Accepted:', info.accepted);
        console.log('Rejected:', info.rejected);

        res.json({
            success: true,
            messageId: info.messageId,
            response: info.response,
            envelope: info.envelope,
            accepted: info.accepted,
            rejected: info.rejected
        });
    } catch (error) {
        console.error('\n=== Email Error ===');
        console.error('Type:', error.name);
        console.error('Message:', error.message);
        
        if (error.code) console.error('Code:', error.code);
        if (error.command) console.error('Command:', error.command);
        if (error.response) console.error('Response:', error.response);
        if (error.responseCode) console.error('Response Code:', error.responseCode);

        // Check if it's an authentication error
        if (error.responseCode === 535) {
            console.log('\nTrying to check Mailu server status...');
            try {
                const https = require('https');
                const req = https.get('https://mail.sileistar.me/admin', {
                    rejectUnauthorized: false
                });
                req.on('response', (res) => {
                    console.log('Mailu server status:', res.statusCode);
                });
                req.on('error', (err) => {
                    console.error('Failed to check Mailu server:', err);
                });
            } catch (checkError) {
                console.error('Failed to check Mailu server:', checkError);
            }
        }

        res.status(500).json({
            success: false,
            error: {
                message: error.message,
                code: error.code,
                command: error.command,
                response: error.response,
                responseCode: error.responseCode
            }
        });
    } finally {
        if (transport) {
            console.log('\nClosing transport...');
            transport.close();
        }
    }
};

exports.getEmails = async (req, res) => {
    // For now, return empty array
    res.json([]);
};

exports.getFolders = async (req, res) => {
    // Return standard folders
    const folders = {
        INBOX: { name: 'INBOX', special_use: '\\Inbox' },
        Sent: { name: 'Sent', special_use: '\\Sent' },
        Drafts: { name: 'Drafts', special_use: '\\Drafts' },
        Trash: { name: 'Trash', special_use: '\\Trash' }
    };

    res.json(folders);
};
