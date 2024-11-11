const axios = require('axios');
const https = require('https');

async function testRoundcubeConnection() {
    console.log('\n=== Testing Roundcube Webmail Connection ===\n');
    
    const email = 'swastik@sileistar.me';
    const password = 'powtayt0h-';
    const baseUrl = 'https://mail.sileistar.me/webmail';

    // Create axios instance with SSL verification disabled
    const client = axios.create({
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        }),
        withCredentials: true
    });

    console.log('Testing with:');
    console.log('Email:', email);
    console.log('Base URL:', baseUrl);
    console.log('Password: [REDACTED]\n');

    try {
        // Step 1: Get session token
        console.log('Getting session token...');
        const initResponse = await client.get(`${baseUrl}/?_task=login`);
        const token = initResponse.headers['set-cookie']
            ?.find(cookie => cookie.includes('roundcube_sessid'))
            ?.split(';')[0];

        if (!token) {
            throw new Error('Failed to get session token');
        }
        console.log('✓ Got session token\n');

        // Step 2: Login
        console.log('Attempting to login...');
        const loginResponse = await client.post(`${baseUrl}/?_task=login`, 
            new URLSearchParams({
                '_token': token,
                '_task': 'login',
                '_action': 'login',
                '_timezone': 'UTC',
                '_url': '_task=login',
                '_user': email,
                '_pass': password
            }), {
                headers: {
                    'Cookie': token,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        if (loginResponse.data.includes('successful')) {
            console.log('✓ Login successful\n');

            // Step 3: Send test email
            console.log('Sending test email...');
            const sendResponse = await client.post(`${baseUrl}/?_task=mail&_action=send`,
                new URLSearchParams({
                    '_token': token,
                    '_task': 'mail',
                    '_action': 'send',
                    '_to': 'swastikgoomber2003@gmail.com',
                    '_subject': 'Test Email from Roundcube',
                    '_message': 'This is a test email sent via Roundcube Webmail'
                }), {
                    headers: {
                        'Cookie': token,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            if (sendResponse.data.includes('success')) {
                console.log('✓ Test email sent successfully\n');
            } else {
                console.log('✗ Failed to send test email\n');
            }

            // Step 4: List folders
            console.log('Fetching folders...');
            const foldersResponse = await client.get(`${baseUrl}/?_task=mail&_action=list`, {
                headers: {
                    'Cookie': token
                }
            });

            console.log('Folders:', foldersResponse.data);
        } else {
            console.log('✗ Login failed\n');
        }
    } catch (error) {
        console.error('Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        // Print detailed error information
        if (error.response) {
            console.log('\nDetailed Error Information:');
            console.log('Status:', error.response.status);
            console.log('Headers:', error.response.headers);
            console.log('Data:', error.response.data);
        }
    }
}

testRoundcubeConnection()
    .then(() => {
        console.log('\n=== Test Complete ===');
        process.exit(0);
    })
    .catch(error => {
        console.error('\nTest failed:', error);
        process.exit(1);
    });
