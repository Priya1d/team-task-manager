const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { checkProjectAdmin } = require('../middleware/checkProjectAccess');

// @route   POST /api/projects
// @desc    Create new project
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    // Create new project
    const project = new Project({
      name,
      description,
      admin: req.user._id,  // Creator becomes admin
      members: [{
        user: req.user._id,
        role: 'admin'
      }]
    });

    await project.save();
    
    // Populate user details
    await project.populate('admin', 'name email');
    await project.populate('members.user', 'name email');

    res.status(201).json(project);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/projects
// @desc    Get all user's projects
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Find projects where user is admin OR a member
    const projects = await Project.find({
      $or: [
        { admin: req.user._id },
        { 'members.user': req.user._id }
      ]
    })
    .populate('admin', 'name email')
    .populate('members.user', 'name email')
    .sort({ createdAt: -1 });  // Newest first

    res.json(projects);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('admin', 'name email')
      .populate('members.user', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access
    const hasAccess = 
      project.admin._id.toString() === req.user._id.toString() ||
      project.members.some(m => m.user._id.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(project);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/projects/:projectId/members
// @desc    Add member to project
// @access  Private (Admin only)
router.post('/:projectId/members', auth, checkProjectAdmin, async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found with this email' 
      });
    }

    // Check if already a member
    const isMember = req.project.members.some(
      m => m.user.toString() === user._id.toString()
    );

    if (isMember) {
      return res.status(400).json({ 
        message: 'User is already a member of this project' 
      });
    }

    // Add member
    req.project.members.push({
      user: user._id,
      role: 'member'
    });

    await req.project.save();
    await req.project.populate('members.user', 'name email');

    res.json(req.project);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/projects/:projectId/members/:userId
// @desc    Remove member from project
// @access  Private (Admin only)
router.delete('/:projectId/members/:userId', auth, checkProjectAdmin, async (req, res) => {
  try {
    // Remove member from array
    req.project.members = req.project.members.filter(
      m => m.user.toString() !== req.params.userId
    );

    await req.project.save();
    await req.project.populate('members.user', 'name email');

    res.json(req.project);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private (Main admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only main admin can delete
    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    await project.deleteOne();
    res.json({ message: 'Project deleted successfully' });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 