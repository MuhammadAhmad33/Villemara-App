const express = require('express');
const router = express.Router();
const lisitngController = require('../controllers/listingController');
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



router.post('/create', upload.single('media'), lisitngController.createListing);
router.get('/:id', lisitngController.getListingById);
router.delete('/:id', lisitngController.deleteListing);
router.post('/:id/like', lisitngController.likeListing);
router.post('/:id/comment', lisitngController.commentOnListing);
router.post('/:id/share', lisitngController.shareListing);

module.exports = router;
