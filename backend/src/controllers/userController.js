const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createMailuAccount, checkMailuAccount } = require('../utils/mailuManager');

exports.register = async (req, res) => {
    try {
        console.log('Registration request:', req.body);
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user exists in our database
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Check if email account exists in Mailu
        const mailExists = await checkMailuAccount(email);
        if (mailExists) {
            return res.status(400).json({ message: 'Email account already exists' });
        }

        // Create Mailu account first
        await createMailuAccount(email, password);

        // Then create user in our database
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            password: hashedPassword,
            emailSettings: {
                imapPassword: password,
                smtpPassword: password
            }
        });

        await user.save();
        console.log('User saved:', user);

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                emailSettings: user.emailSettings
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Registration failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.login = async (req, res) => {
    try {
        console.log('Login request:', req.body);
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Verify Mailu account exists
        const mailExists = await checkMailuAccount(email);
        if (!mailExists) {
            // If Mailu account doesn't exist, create it
            await createMailuAccount(email, password);
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        console.log('Login successful:', user.email);

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                emailSettings: user.emailSettings
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Login failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ 
            message: 'Failed to get profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.updateEmailSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        // Update email settings
        user.emailSettings = {
            imapPassword: req.body.imapPassword,
            smtpPassword: req.body.smtpPassword
        };

        await user.save();
        res.json(user);
    } catch (error) {
        console.error('Update email settings error:', error);
        res.status(500).json({ 
            message: 'Failed to update email settings',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
