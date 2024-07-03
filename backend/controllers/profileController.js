const { Project, Experience, Profile } = require('../models/profile');
const multer = require('multer');

// Create a new profile
async function createProfile(req, res) {
    const { name, headline, companyName, linkedin, instagram, facebook, bookAppointment } = req.body;
    const userId = req.body.user;///////

    try {
        const newProfile = new Profile({
            user: userId,
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
    upload(req, res, async function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const { description, completionDate } = req.body;
        const profileId = req.params.profileId;
        const media = req.file ? req.file.path : '';

        try {
            const newProject = new Project({
                media,
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
    });
}

// Add experience to the profile
async function addExperience(req, res) {
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

module.exports = {
    createProfile,
    addProject,
    addExperience,
    getProfileByUserId
};