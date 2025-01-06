const Project = require('../models/ProjectModel');
const StudyGroup = require('../models/StudyGroupModel');
const User = require('../models/UserModel');
const path = require('path');
const fs = require('fs');

// Create a project
const createProject = async (req, res) => {
  try {
    const { project_name, description, group_id } = req.body;
    const userId = req.user._id;

    let projectImage = null;
    if (req.files) {
      const { projectPhoto } = req.files;
      projectImage = `project-photo-${Date.now()}-${projectPhoto.name}`;
      const uploadPath = path.join(__dirname, `../public/${projectImage}`);
      const directoryPath = path.join(__dirname, '../public');
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
      }
      await projectPhoto.mv(uploadPath);
    }
    const newGroup = new StudyGroup({
        project_name,
        description,
        groupPhoto: projectImage,
        created_by: userId,
        members: [{ user_id: userId, joined_at: Date.now() }],
      });
  
      await newGroup.save();

    const newProject = new Project({
      project_name,
      description,
      created_by: userId,
      group_id:newGroup._id,
      image:projectImage,
      members: [{ user_id: userId, joined_at: Date.now() }],
    });

    await newProject.save();

    // Add project to user's list of projects
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { projects: newProject._id } },
      { new: true }
    );

    res.status(201).json({ message: 'Project created successfully', project: newProject });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

// Send join request to a project
const sendJoinRequest = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const isAlreadyMember = project.members.some((member) => member.user_id.toString() === userId);
    const hasAlreadyRequested = project.join_requests.some((request) => request.user_id.toString() === userId);

    if (isAlreadyMember) {
      return res.status(400).json({ error: 'You are already a member of this project' });
    }

    if (hasAlreadyRequested) {
      return res.status(400).json({ error: 'You have already sent a join request to this project' });
    }

    project.join_requests.push({ user_id: userId });
    await project.save();

    res.status(200).json({ message: 'Join request sent successfully' });
  } catch (error) {
    console.error('Error sending join request:', error);
    res.status(500).json({ error: 'Failed to send join request' });
  }
};

// Accept a join request for a project
const acceptJoinRequest = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const adminId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.created_by.toString() !== adminId) {
      return res.status(403).json({ error: 'Only the project admin can accept join requests' });
    }

    const requestIndex = project.join_requests.findIndex((request) => request.user_id.toString() === userId);
    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Join request not found' });
    }

    project.members.push({ user_id: userId, joined_at: Date.now() });
    project.join_requests.splice(requestIndex, 1);

    await project.save();

    res.status(200).json({ message: 'User has been added to the project as a member', project });
  } catch (error) {
    console.error('Error accepting join request:', error);
    res.status(500).json({ error: 'Failed to accept join request' });
  }
};

// Reject a join request for a project
const rejectJoinRequest = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const adminId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.created_by.toString() !== adminId) {
      return res.status(403).json({ error: 'Only the project admin can reject join requests' });
    }

    const requestIndex = project.join_requests.findIndex((request) => request.user_id.toString() === userId);
    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Join request not found' });
    }

    project.join_requests.splice(requestIndex, 1);

    await project.save();

    res.status(200).json({ message: 'Join request rejected successfully', project });
  } catch (error) {
    console.error('Error rejecting join request:', error);
    res.status(500).json({ error: 'Failed to reject join request' });
  }
};

// Update project details
const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { project_name, description } = req.body;
    const adminId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.created_by.toString() !== adminId) {
      return res.status(403).json({ error: 'Only the project admin can update project details' });
    }

    if (project_name) project.project_name = project_name;
    if (description) project.description = description;

    await project.save();

    res.status(200).json({ message: 'Project details updated successfully', project });
  } catch (error) {
    console.error('Error updating project details:', error);
    res.status(500).json({ error: 'Failed to update project details' });
  }
};

// Get projects for the user
const getUserProjects = async (req, res) => {
  try {
    const userId = req.user._id;

    const projects = await Project.find({ 'members.user_id': userId });
    res.status(200).json({ projects });
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ error: 'Failed to fetch user projects' });
  }
};

// Get all projects
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('created_by', 'name email');

    res.status(200).json({ message: 'All projects retrieved successfully', projects });
  } catch (error) {
    console.error('Error fetching all projects:', error);
    res.status(500).json({ error: 'Failed to fetch all projects' });
  }
};

module.exports = {
  createProject,
  sendJoinRequest,
  acceptJoinRequest,
  rejectJoinRequest,
  updateProject,
  getUserProjects,
  getAllProjects,
};
