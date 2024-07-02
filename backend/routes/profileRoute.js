const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
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

router.post('/create', profileController.createProfile);
router.post('/:profileId/project', upload.single('media'), profileController.addProject);
router.post('/:profileId/experience', profileController.addExperience);
router.get('/user/:userId', profileController.getProfileByUserId);

module.exports = router;
