const UserSignup = require('../models/registration');
const sendEmail = require('../utils/sendEmail');
const { generateToken } = require('../utils/jwt');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

async function registerUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, confirmEmail, password, confirmPassword, companyHouseNo } = req.body;
    const subject = 'Registration Confirmation';
    const confirmationMessage = `
    Hi ${firstName}!
    Thank you for signing up for our platform!
    \nBest regards,\nVillemara`;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new UserSignup({
            firstName,
            lastName,
            email,
            confirmEmail,
            password: hashedPassword,
            confirmPassword: hashedPassword,
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const user = await UserSignup.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = generateToken(user._id);

        res.status(200).json({ message: 'Login successful', user, token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
}

async function getUserById(req, res) {
    const { id } = req.params;

    try {
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

async function forgotPassword(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    try {
        const user = await UserSignup.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
        const subject = 'Password Reset Request';
        const resetMessage = `
        Hi ${user.firstName}!
        You requested a password reset. Please click the following link to reset your password:
        ${resetUrl}
        \nBest regards,\nVillemara`;

        await sendEmail(email, subject, resetMessage);

        res.status(200).json({ message: 'Password reset email sent', resetUrl });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function resetPassword(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.params;
    const { password } = req.body;

    try {
        const user = await UserSignup.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.confirmPassword = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    registerUser,
    loginUser,
    getUserById,
    forgotPassword,
    resetPassword
};
