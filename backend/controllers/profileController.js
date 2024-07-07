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
};


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


module.exports = {
    createProfile,
    addProject,
    addExperience,
    getProfileByUserId,
    getProjectsByProfileId,
    getExperiencesByProfileId,
    editProfile,
    deleteProject,
    deleteExperience
};