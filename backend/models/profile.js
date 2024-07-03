const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Project schema
const projectSchema = new Schema({
    media: { type: String },  // URL to the image/video
    description: { type: String, required: true },
    completionDate: { type: Date, required: true }
}, { timestamps: true });

// Define the Experience schema
const experienceSchema = new Schema({
    companyName: { type: String, required: true },
    designation: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    jobDescription: { type: String, required: true }
}, { timestamps: true });

// Define the Profile schema
const profileSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'UserSignup', required: true },
    name: { type: String, required: true },
    headline: { type: String, required: true },
    companyName: { type: String, required: true },
    linkedin: { type: String },
    instagram: { type: String },
    facebook: { type: String },
    bookAppointment: { type: Boolean, default: false },
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    experiences: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Experience' }]
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);
const Experience = mongoose.model('Experience', experienceSchema);
const Profile = mongoose.model('Profile', profileSchema);

module.exports = {
    Project,
    Experience,
    Profile
};