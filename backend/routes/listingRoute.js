// src/routes/listingRoutes.js
const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const listingController = require('../controllers/listingController');
const multer = require('multer');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');  // Specify the upload directory
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);  // Generate a unique filename
    }
});

const upload = multer({ storage: storage });

const validateListing = [
    check('caption').not().isEmpty().withMessage('Caption is required'),
    check('category').not().isEmpty().withMessage('Category is required'),
    check('location').optional().isString().withMessage('Location must be a string'),
    check('taggedUsers').optional().isArray().withMessage('Tagged users must be an array'),
    check('tags').optional().isArray().withMessage('Tags must be an array'),
];

// Routes
router.post('/create', upload.single('media'), validateListing, listingController.createListing);
router.get('/:id', listingController.getListingById);
router.delete('/:id', listingController.deleteListing);
router.post('/:id/like', listingController.likeListing);
router.post('/:id/comment', listingController.commentOnListing);
router.post('/:id/share', listingController.shareListing);

module.exports = router;
