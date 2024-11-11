const axios = require('axios');

async function testWebmailConnection() {
    console.log('\n=== Testing Mailu Webmail Connection ===\n');
    
    const email = 'swastik@sileistar.me';
    const password = 'powtayt0h-';
    const baseUrl = 'https://mail.sileistar.me';

    console.log('Testing with credentials:');
    console.log('Email:', email);
    console.log('Base URL:', baseUrl);
    console.log('Password: [REDACTED]\n');

    try {
        // First, try to authenticate
        console.log('Attempting to authenticate...');
        const authResponse = await axios.post(`${baseUrl}/api/v1/token`, {
            username: email,
            password: password
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (authResponse.data.token) {
            console.log('✓ Authentication successful');
            const token = authResponse.data.token;

            // Try to get mailboxes
            console.log('\nFetching mailboxes...');
            const mailboxesResponse = await axios.get(`${baseUrl}/api/v1/mailboxes`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Available mailboxes:', mailboxesResponse.data);

            // Try to send a test email
            console.log('\nSending test email...');
            const sendResponse = await axios.post(`${baseUrl}/api/v1/messages`, {
                to: ['swastikgoomber2003@gmail.com'],
                subject: 'Test Email from Webmail API',
                text: 'This is a test email sent via Mailu Webmail API'
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✓ Test email sent:', sendResponse.data);
        }
    } catch (error) {
        console.error('Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
    }
}

testWebmailConnection()
    .then(() => {
        console.log('\n=== Test Complete ===');
        process.exit(0);
    })
    .catch(error => {
        console.error('\nTest failed:', error);
        process.exit(1);
    });
