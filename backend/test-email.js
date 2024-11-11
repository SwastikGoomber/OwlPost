require('dotenv').config();
const nodemailer = require('nodemailer');
const Imap = require('imap');

async function testEmailConnections() {
    console.log('\n=== Testing Email Connections ===\n');
    
    const email = 'swastik@sileistar.me';
    const password = 'powtayt0h-';

    console.log('Testing with credentials:');
    console.log('Email:', email);
    console.log('Password: [REDACTED]\n');

    // Test SMTP
    console.log('Testing SMTP connection...');
    try {
        const transport = nodemailer.createTransport({
            host: 'mail.sileistar.me',
            port: 465,
            secure: true,
            auth: {
                user: email,
                pass: password
            },
            tls: {
                rejectUnauthorized: false
            },
            debug: true
        });

        console.log('Verifying SMTP connection...');
        await transport.verify();
        console.log('✓ SMTP connection successful\n');

        console.log('Attempting to send test email...');
        const result = await transport.sendMail({
            from: email,
            to: 'swastikgoomber2003@gmail.com',
            subject: 'Test Email',
            text: 'This is a test email from OwlPost'
        });
        console.log('✓ Test email sent:', result.messageId, '\n');
    } catch (error) {
        console.error('✗ SMTP Error:', error.message, '\n');
    }

    // Test IMAP
    console.log('Testing IMAP connection...');
    try {
        const imap = new Imap({
            user: email,
            password: password,
            host: 'mail.sileistar.me',
            port: 993,
            tls: true,
            tlsOptions: { rejectUnauthorized: false },
            debug: console.log
        });

        await new Promise((resolve, reject) => {
            imap.once('ready', () => {
                console.log('✓ IMAP connection successful');
                console.log('Listing mailboxes...');
                
                imap.getBoxes((err, boxes) => {
                    if (err) reject(err);
                    console.log('Available mailboxes:', Object.keys(boxes));
                    imap.end();
                    resolve();
                });
            });

            imap.once('error', (err) => {
                reject(err);
            });

            imap.connect();
        });
    } catch (error) {
        console.error('✗ IMAP Error:', error.message);
    }
}

testEmailConnections()
    .then(() => {
        console.log('\n=== Test Complete ===');
        process.exit(0);
    })
    .catch(error => {
        console.error('\nTest failed:', error);
        process.exit(1);
    });
