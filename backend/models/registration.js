const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the User schema
const userSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    confirmEmail: { type: String, required: true },
    password: { type: String, required: true },
    confirmPassword: { type: String, required: true },
    company: { type: String, required: false },
    houseNo: { type: String, required: false },
}, { timestamps: true });

// Middleware to validate email and confirm email match
userSchema.pre('save', function (next) {
    if (this.email !== this.confirmEmail) {
        return next(new Error('Emails do not match'));
    }
    if (this.password !== this.confirmPassword) {
        return next(new Error('Passwords do not match'));
    }
    next();
});

module.exports = mongoose.model('UserSignup', userSchema);
