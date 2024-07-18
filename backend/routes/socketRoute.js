// src/routes/socketRoutes.js
const express = require('express');
const router = express.Router();
const socketController = require('../controllers/socketController');

router.get('/connect', (req, res) => {
    res.send("Socket.io server is running.");
});

module.exports = router;
