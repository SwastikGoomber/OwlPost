const axios = require('axios');
const https = require('https');

// Create axios instance for Mailu admin interface
const mailuClient = axios.create({
    baseURL: 'https://mail.sileistar.me',
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    }),
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    maxRedirects: 5
});

async function getAdminSession() {
    try {
        console.log('\n=== Getting Admin Session ===');
        
        // Get login page to get CSRF token
        const loginPage = await mailuClient.get('/admin/login');
        const csrfMatch = loginPage.data.match(/name="csrf_token" value="([^"]+)"/);
        if (!csrfMatch) {
            throw new Error('Could not find CSRF token');
        }
        const csrfToken = csrfMatch[1];

        // Login as admin
        const loginResponse = await mailuClient.post('/admin/login', new URLSearchParams({
            'csrf_token': csrfToken,
            'email': 'admin@sileistar.me',
            'password': 'powtayt0h',
            'submit': 'Login'
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // Get session cookie
        const cookies = loginResponse.headers['set-cookie'];
        if (!cookies) {
            throw new Error('No session cookie received');
        }

        return {
            cookie: cookies.join('; '),
            csrf: csrfToken
        };
    } catch (error) {
        console.error('Failed to get admin session:', error.message);
        throw error;
    }
}

async function createMailuAccount(email, password) {
    try {
        console.log('\n=== Creating Mailu Account ===');
        console.log('Email:', email);

        // Get admin session
        const session = await getAdminSession();

        // Get user creation form to get new CSRF token
        const formPage = await mailuClient.get('/admin/user/new', {
            headers: {
                'Cookie': session.cookie
            }
        });
        const csrfMatch = formPage.data.match(/name="csrf_token" value="([^"]+)"/);
        if (!csrfMatch) {
            throw new Error('Could not find CSRF token');
        }
        const csrfToken = csrfMatch[1];

        // Create user through form submission
        const response = await mailuClient.post('/admin/user/new', new URLSearchParams({
            'csrf_token': csrfToken,
            'localpart': email.split('@')[0],
            'domain': email.split('@')[1],
            'password': password,
            'confirm': password,
            'quota_bytes': '1000000000',
            'enable_imap': 'on',
            'enable_pop': 'on',
            'enable_webmail': 'on',
            'enabled': 'on',
            'submit': 'Create'
        }), {
            headers: {
                'Cookie': session.cookie,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        console.log('Mailu account created successfully');
        return true;
    } catch (error) {
        console.error('\n=== Mailu Account Creation Error ===');
        console.error('Type:', error.name);
        console.error('Message:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data?.substring(0, 200));
        }
        throw new Error(`Failed to create email account: ${error.message}`);
    }
}

async function checkMailuAccount(email) {
    try {
        console.log('\n=== Checking Mailu Account ===');
        console.log('Email:', email);

        // Get admin session
        const session = await getAdminSession();

        // Get user list
        const response = await mailuClient.get('/admin/user/list', {
            headers: {
                'Cookie': session.cookie
            }
        });

        // Check if email exists in the response
        const exists = response.data.includes(email);
        console.log(exists ? 'Mailu account exists' : 'Mailu account does not exist');
        return exists;
    } catch (error) {
        console.error('\n=== Mailu Account Check Error ===');
        console.error('Message:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data?.substring(0, 200));
        }
        throw new Error(`Failed to check email account: ${error.message}`);
    }
}

async function deleteMailuAccount(email) {
    try {
        console.log('\n=== Deleting Mailu Account ===');
        console.log('Email:', email);

        // Get admin session
        const session = await getAdminSession();

        // Get delete form to get CSRF token
        const formPage = await mailuClient.get(`/admin/user/delete/${email}`, {
            headers: {
                'Cookie': session.cookie
            }
        });
        const csrfMatch = formPage.data.match(/name="csrf_token" value="([^"]+)"/);
        if (!csrfMatch) {
            throw new Error('Could not find CSRF token');
        }
        const csrfToken = csrfMatch[1];

        // Delete user through form submission
        await mailuClient.post(`/admin/user/delete/${email}`, new URLSearchParams({
            'csrf_token': csrfToken,
            'submit': 'Delete'
        }), {
            headers: {
                'Cookie': session.cookie,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        console.log('Mailu account deleted successfully');
        return true;
    } catch (error) {
        console.error('\n=== Mailu Account Deletion Error ===');
        console.error('Message:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data?.substring(0, 200));
        }
        throw new Error(`Failed to delete email account: ${error.message}`);
    }
}

module.exports = {
    createMailuAccount,
    deleteMailuAccount,
    checkMailuAccount
};
