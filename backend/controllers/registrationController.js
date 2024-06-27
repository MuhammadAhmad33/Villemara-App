const UserSignup = require('../models/registration');
const sendEmail = require('../utils/sendEmail');

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
        res.status(201).json({ message: 'User registered successfully', user: savedUser });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = { registerUser };
