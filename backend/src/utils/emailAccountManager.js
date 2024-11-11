const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

const SCRIPT_PATH = '/root/manage_owlpost.sh';

/**
 * Creates an email account on the mail server
 * @param {string} email - The full email address
 * @param {string} password - The password for the email account
 * @returns {Promise<void>}
 */
const createEmailAccount = async (email, password) => {
    try {
        console.log(`Attempting to create/update email account for: ${email}`);
        
        // Extract username from email (everything before @)
        const username = email.split('@')[0];
        
        console.log('Using script at path:', SCRIPT_PATH);
        console.log('Username extracted:', username);

        // Validate inputs
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        // Execute the command
        const command = `sudo ${SCRIPT_PATH} create ${username} ${password}`;
        console.log('Executing command (password hidden):', command.replace(password, '********'));

        const { stdout, stderr } = await execAsync(command);
        
        if (stderr) {
            console.error('Error output from script:', stderr);
            throw new Error(`Error creating email account: ${stderr}`);
        }

        console.log('Success output from script:', stdout);
        return stdout;
    } catch (error) {
        console.error('Error in createEmailAccount:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            signal: error.signal,
            path: error.path
        });
        throw new Error(`Failed to create email account: ${error.message}`);
    }
};

/**
 * Deletes an email account from the mail server
 * @param {string} email - The full email address
 * @returns {Promise<void>}
 */
const deleteEmailAccount = async (email) => {
    try {
        console.log(`Attempting to delete email account: ${email}`);
        
        // Extract username from email (everything before @)
        const username = email.split('@')[0];
        
        console.log('Using script at path:', SCRIPT_PATH);
        console.log('Username extracted:', username);

        // Validate input
        if (!email) {
            throw new Error('Email is required');
        }

        // Execute the command
        const command = `sudo ${SCRIPT_PATH} delete ${username}`;
        console.log('Executing command:', command);

        const { stdout, stderr } = await execAsync(command);
        
        if (stderr) {
            console.error('Error output from script:', stderr);
            throw new Error(`Error deleting email account: ${stderr}`);
        }

        console.log('Success output from script:', stdout);
        return stdout;
    } catch (error) {
        console.error('Error in deleteEmailAccount:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            signal: error.signal,
            path: error.path
        });
        throw new Error(`Failed to delete email account: ${error.message}`);
    }
};

module.exports = {
    createEmailAccount,
    deleteEmailAccount
};
