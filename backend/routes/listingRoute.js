const express = require('express');
const router = express.Router();
const { check} = require('express-validator');
const lisitngController = require('../controllers/listingController');
const auth = require('../middleware/auth')
// Middleware for uploading media
const uploadMedia = require('../utils/uploadService').upload.single('media');


const validateListings = [
    check('caption').not().isEmpty().withMessage('Caption is required'),
    check('category').not().isEmpty().withMessage('Category is required'),
];


router.post('/create/:id',uploadMedia,validateListings, lisitngController.createListing);
router.get('/allListings',lisitngController.getAllListings)
router.get('/:id', lisitngController.getListingById);
router.delete('/:id', lisitngController.deleteListing);
router.post('/:id/like', auth, lisitngController.likeListing);
router.post('/:id/comment', auth, lisitngController.commentOnListing);
router.post('/:id/share', auth, lisitngController.shareListing);

module.exports = router;
