// src/controllers/profileController.js
const { validationResult } = require('express-validator');
const { Project, Experience, Profile, Recommendation } = require('../models/profile');
const UserSignup = require('../models/registration');
const {generateFileUrl } = require('../utils/uploadService');

// Create a new profile
async function createProfile(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, headline, companyName, linkedin, instagram, facebook, bookAppointment, user } = req.body;
    let mediaUrl = '';

    if (req.file) {
        mediaUrl = generateFileUrl('profilePicture', req.file.path);  // Generate URL for the uploaded file
    }

    try {
        const newProfile = new Profile({
            user,
            media: mediaUrl,
            name,
            headline,
            companyName,
            linkedin,
            instagram,
            facebook,
            bookAppointment
        });

        await newProfile.save();
        res.status(201).json(newProfile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Add a project to the profile
async function addProject(req, res) {
    
    console.log(req.body);
    console.log(req.file);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { description, completionDate } = req.body;
    const profileId = req.params.profileId;
    let mediaUrl ='';

    if (req.file) {
        mediaUrl = generateFileUrl('projectMedia', req.file.path);  // Generate URL for the uploaded file
    }

    try {
        const newProject = new Project({
            media: mediaUrl,
            description,
            completionDate
        });

        await newProject.save();

        const profile = await Profile.findById(profileId);
        profile.projects.push(newProject._id);
        await profile.save();

        res.status(201).json(newProject);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Add experience to the profile
async function addExperience(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { companyName, designation, startDate, endDate, jobDescription } = req.body;
    const profileId = req.params.profileId;

    try {
        const newExperience = new Experience({
            companyName,
            designation,
            startDate,
            endDate,
            jobDescription
        });

        await newExperience.save();

        const profile = await Profile.findById(profileId);
        profile.experiences.push(newExperience._id);
        await profile.save();

        res.status(201).json(newExperience);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Get a profile by user ID
async function getProfileByUserId(req, res) {
    try {
        const profile = await Profile.findOne({ user: req.params.userId })
            .populate('projects')
            .populate('experiences');

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Get projects by profile ID
async function getProjectsByProfileId(req, res) {
    try {
        const profile = await Profile.findById(req.params.profileId).populate('projects');
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.status(200).json(profile.projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Get experiences by profile ID
async function getExperiencesByProfileId(req, res) {
    try {
        const profile = await Profile.findById(req.params.profileId).populate('experiences');
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.status(200).json(profile.experiences);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Edit a profile
async function editProfile(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, headline, companyName, linkedin, instagram, facebook, bookAppointment } = req.body;
    const profileId = req.params.profileId;

    try {
        const updatedProfile = await Profile.findByIdAndUpdate(
            profileId,
            { name, headline, companyName, linkedin, instagram, facebook, bookAppointment },
            { new: true }
        );

        if (!updatedProfile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.status(200).json(updatedProfile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Delete a project from the profile
async function deleteProject(req, res) {
    const profileId = req.params.profileId;
    const projectId = req.params.projectId;

    try {
        await Project.findByIdAndDelete(projectId);
        const profile = await Profile.findById(profileId);
        profile.projects.pull(projectId);
        await profile.save();

        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Delete an experience from the profile
async function deleteExperience(req, res) {
    const profileId = req.params.profileId;
    const experienceId = req.params.experienceId;

    try {
        await Experience.findByIdAndDelete(experienceId);
        const profile = await Profile.findById(profileId);
        profile.experiences.pull(experienceId);
        await profile.save();

        res.status(200).json({ message: 'Experience deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function addRecommendation(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { member, text } = req.body;
    const { profileId } = req.params;
    console.log(member, profileId);
    try {
        const newRecommendation = new Recommendation({
            member,
            text
        });

        await newRecommendation.save();

        // Add to the profile's recommendationsGiven
        const profile = await Profile.findById(profileId);
        profile.recommendationsGiven.push(newRecommendation._id);
        await profile.save();
        console.log(profile.recommendationsGiven, 'given');
        // Add to the member's recommendationsReceived
        const memberProfile = await Profile.findById(member);
        console.log(memberProfile, 'member');
        memberProfile.recommendationsReceived.push(newRecommendation._id);
        await memberProfile.save();
        console.log(memberProfile.recommendationsReceived, 'received');
        res.status(201).json(newRecommendation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Get recommendations given by profile ID
async function getRecommendationsGiven(req, res) {
    try {
        const profile = await Profile.findById(req.params.profileId).populate('recommendationsGiven');
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.status(200).json(profile.recommendationsGiven);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Get recommendations received by profile ID
async function getRecommendationsReceived(req, res) {
    try {
        const profile = await Profile.findById(req.params.profileId).populate('recommendationsReceived');
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.status(200).json(profile.recommendationsReceived);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
async function getAllProfiles(req, res) {
        try {
            const profiles = await Profile.find();
            res.status(200).json(profiles);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }


module.exports = {
    createProfile,
    addProject,
    addExperience,
    getProfileByUserId,
    getProjectsByProfileId,
    getExperiencesByProfileId,
    editProfile,
    deleteProject,
    deleteExperience,
    addRecommendation,
    getRecommendationsGiven,
    getRecommendationsReceived,
    getAllProfiles,
}