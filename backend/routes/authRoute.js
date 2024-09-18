const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

// User registration route
router.post('/register', [
    check('firstName').not().isEmpty().withMessage('First name is required'),
    check('lastName').not().isEmpty().withMessage('Last name is required'),
    check('email').isEmail().withMessage('Valid email is required'),
    check('confirmEmail').isEmail().withMessage('Valid confirm email is required'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    check('confirmPassword').isLength({ min: 6 }).withMessage('Confirm password must be at least 6 characters long'),
    check('companyHouseNo').not().isEmpty().withMessage('Company house number is required')
], authController.registerUser);

router.post('/login', [
    check('email').isEmail().withMessage('Valid email is required'),
    check('password').not().isEmpty().withMessage('Password is required')
], authController.loginUser);

router.get('/getUser/:id', authController.getUserById);

router.post('/forgot-password', [
    check('email').isEmail().withMessage('Valid email is required')
], authController.forgotPassword);

router.post('/reset-password', [
    check('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], auth, authController.resetPassword);

router.get('/search',authController.search)

module.exports = router;
