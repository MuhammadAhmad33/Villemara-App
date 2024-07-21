// src/services/uploadService.js
const multer = require('multer');
const path = require('path');

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

function generateFileUrl(context, filePath) {
    let fileUrl;

    switch (context) {
        case 'profilePicture':
            fileUrl = `https://example.com/profile-pictures/${path.basename(filePath)}`;
            break;
        case 'document':
            fileUrl = `https://example.com/documents/${path.basename(filePath)}`;
            break;
        case 'projectMedia':
            fileUrl = `https://example.com/project-media/${path.basename(filePath)}`;
            break;
        case 'listingMedia':
            fileUrl = `https://example.com/listing-media/${path.basename(filePath)}`;
            break;
        case 'postMedia':
            fileUrl = `https://example.com/post-media/${path.basename(filePath)}`;
            break;
        case 'storyMedia':
            fileUrl = `https://example.com/story-media/${path.basename(filePath)}`;
            break;
        default:
            fileUrl = `https://example.com/others/${path.basename(filePath)}`;
            break;
    }

    return fileUrl;
}

module.exports = {
    upload,
    generateFileUrl
};