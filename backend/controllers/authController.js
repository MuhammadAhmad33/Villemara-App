const UserSignup = require('../models/registration');
const Login = require('../models/registration');
const sendEmail = require('../utils/sendEmail');
const { generateToken } = require('../utils/jwt');

async function registerUser(req, res) {
    const { firstName, lastName, email, confirmEmail, password, confirmPassword, companyHouseNo } = req.body;
    const subject = 'Registration Confirmation';
    const confirmationMessage = `
    Hi ${firstName}!
    Thank you for signing up for our platform!
    \nBest regards,\nVillemara`;

    try {
        const newUser = new UserSignup({
            firstName,
            lastName,
            email,
            confirmEmail,
            password,
            confirmPassword,
            companyHouseNo,
        });

        await sendEmail(email, subject, confirmationMessage);

        const savedUser = await newUser.save();

        const token = generateToken(newUser._id);

        res.status(201).json({ message: 'User registered successfully', user: savedUser, token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function loginUser(req, res) {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await Login.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate password
        if (password !== user.password) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = generateToken(user._id);

        // Login successful
        res.status(200).json({ message: 'Login successful', user, token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
};

async function getUserById(req, res) {
    const { id } = req.params;

    try {
        // Find user by ID
        const user = await UserSignup.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user' });
    }
}


module.exports = {
    registerUser,
    loginUser,
    getUserById
};
