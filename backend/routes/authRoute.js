const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
// User registration route
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/getUser/:id', authController.getUserById)
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);


module.exports = router;
