const Project = require('../models/Project');

// Check if user is a member of the project
const checkProjectAccess = async (req, res, next) => {
  try {
    // Get project ID from URL params or request body
    const projectId = req.params.projectId || req.body.project;
    
    // Find the project
    const project = await Project.findById(projectId);

    // Check if project exists
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is admin or a member
    const isAdmin = project.admin.toString() === req.user._id.toString();
    const isMember = project.members.some(
      member => member.user.toString() === req.user._id.toString()
    );

    if (!isAdmin && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Attach project to request for later use
    req.project = project;
    next();
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check if user is admin of the project
const checkProjectAdmin = async (req, res, next) => {
  try {
    // Get project ID
    const projectId = req.params.projectId || req.body.project;
    
    // Find the project
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the main admin
    const isMainAdmin = project.admin.toString() === req.user._id.toString();
    
    // Check if user is a member with admin role
    const isMemberAdmin = project.members.some(
      member => member.user.toString() === req.user._id.toString() && 
               member.role === 'admin'
    );

    if (!isMainAdmin && !isMemberAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Attach project to request
    req.project = project;
    next();
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export both functions
module.exports = { checkProjectAccess, checkProjectAdmin };