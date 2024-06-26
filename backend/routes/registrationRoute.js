const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');

// User registration route
router.post('/register', registrationController.registerUser);

module.exports = router;
