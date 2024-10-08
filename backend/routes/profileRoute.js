// src/routes/profileRoutes.js
const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const profileController = require('../controllers/profileController');

// Middleware for uploading media
const uploadMedia = require('../utils/uploadService').upload.single('media');

const validateProfile = [
    check('name').not().isEmpty().withMessage('Name is required'),
    check('headline').not().isEmpty().withMessage('Headline is required'),
    check('companyName').not().isEmpty().withMessage('Company name is required'),
    check('linkedin').optional().isURL().withMessage('LinkedIn must be a valid URL'),
    check('instagram').optional().isURL().withMessage('Instagram must be a valid URL'),
    check('facebook').optional().isURL().withMessage('Facebook must be a valid URL'),
    check('bookAppointment').optional().isBoolean().withMessage('Book appointment must be a boolean'),
    check('user').not().isEmpty().withMessage('User ID is required'),
];

const validateProject = [
    check('description').not().isEmpty().withMessage('Description is required'),
    check('completionDate').isDate().withMessage('Completion date must be a valid date'),
];

const validateExperience = [
    check('companyName').not().isEmpty().withMessage('Company name is required'),
    check('designation').not().isEmpty().withMessage('Designation is required'),
    check('startDate').isDate().withMessage('Start date must be a valid date'),
    check('endDate').optional().isDate().withMessage('End date must be a valid date'),
    check('jobDescription').not().isEmpty().withMessage('Job description is required'),
];

const validateRecommendation = [
    check('member').not().isEmpty().withMessage('Member ID is required'),
    check('text').not().isEmpty().withMessage('Text is required')
];

// Routes
router.post('/create',uploadMedia, validateProfile, profileController.createProfile);
router.get('/allProfiles',profileController.getAllProfiles);
router.post('/:profileId/project', uploadMedia, validateProject, profileController.addProject);
router.post('/:profileId/experience', validateExperience, profileController.addExperience);
router.get('/user/:userId', profileController.getProfileByUserId);
router.get('/:profileId/projects', profileController.getProjectsByProfileId);
router.get('/:profileId/experiences', profileController.getExperiencesByProfileId);
router.put('/:profileId', validateProfile, profileController.editProfile);
router.delete('/:profileId/project/:projectId', profileController.deleteProject);
router.delete('/:profileId/experience/:experienceId', profileController.deleteExperience);
// New routes for recommendations
router.post('/:profileId/recommendation', validateRecommendation, profileController.addRecommendation);
router.get('/:profileId/recommendations/given', profileController.getRecommendationsGiven);
router.get('/:profileId/recommendations/received', profileController.getRecommendationsReceived);

module.exports = router;
