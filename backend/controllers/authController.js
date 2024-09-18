const UserSignup = require('../models/registration');
const sendEmail = require('../utils/sendEmail');
const { generateToken } = require('../utils/jwt');
const Listing = require('../models/listings');
const Post= require('../models/posts');
const Profile = require('../models/profile').Profile;
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
        else {
            console.log(user);
            return res.status(200).json({ message: 'User found' });
        }
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Email does not exist kindly provide a valid email' });
    }
}

async function resetPassword(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user._id;
    const { newPassword } = req.body;
    const { confirmPassword } = req.body;
    
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        const user = await UserSignup.findById(userId);

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
        }
        console.log(user.password);
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.confirmPassword = hashedPassword;
        console.log(user.password);
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
// Search endpoint
async function search (req, res){
    const searchQuery = req.query.q; // Get the search term from the query params

    if (!searchQuery || searchQuery.trim() === "") {
        return res.status(400).send({ message: 'Search query is required' });
    }

    try {
        // Create search query object using regex for case-insensitive matching
        const searchRegex = new RegExp(searchQuery, 'i');

        // Run searches in all three collections in parallel
        const [posts, profiles, listings] = await Promise.all([
            Post.find({
                $or: [
                    { thoughts: searchRegex },
                    { location: searchRegex },
                    { tags: searchRegex },
                    { "comments.text": searchRegex }
                ]
            }).populate('profile taggedUsers comments.user likes.user'),

            Profile.find({
                $or: [
                    { name: searchRegex },
                    { headline: searchRegex },
                    { companyName: searchRegex }
                ]
            }).populate('user projects experiences recommendationsGiven recommendationsReceived'),

            Listing.find({
                $or: [
                    { caption: searchRegex },
                    { location: searchRegex },
                    { tags: searchRegex }
                ]
            }).populate('profile taggedUsers likes.user comments.user shares.user')
        ]);

        // Return the results in an object with separate arrays for each collection
        res.status(200).json({
            posts,
            profiles,
            listings
        });
    } catch (error) {
        console.error("Error during search:", error);
        res.status(500).send({ message: 'An error occurred while searching', error: error.message });
    }
};


module.exports = {
    registerUser,
    loginUser,
    getUserById,
    forgotPassword,
    resetPassword,
    search
};
