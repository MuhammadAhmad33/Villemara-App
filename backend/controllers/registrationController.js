const UserSignup = require('../models/registration');

async function registerUser(req, res) {
    const { firstName, lastName, email, confirmEmail, password, confirmPassword, companyHouseNo } = req.body;

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

        const savedUser = await newUser.save();
        res.status(201).json({ message: 'User registered successfully', user: savedUser });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = { registerUser };
