const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
// User registration route
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/getUser/:id', authController.getUserById)
module.exports = router;
