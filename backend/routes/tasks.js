const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const { checkProjectAccess, checkProjectAdmin } = require('../middleware/checkProjectAccess');

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private (Admin only)
router.post('/', auth, checkProjectAdmin, async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate, project } = req.body;

    const task = new Task({
      project,
      title,
      description,
      assignedTo,
      priority,
      dueDate,
      createdBy: req.user._id
    });

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.status(201).json(task);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/tasks/project/:projectId
// @desc    Get all tasks for a project
// @access  Private
router.get('/project/:projectId', auth, checkProjectAccess, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/tasks/my-tasks
// @desc    Get all tasks assigned to current user
// @access  Private
router.get('/my-tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('project', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Get the project to check roles
    const project = await require('../models/Project').findById(task.project);
    
    // Check if user is admin
    const isAdmin = 
      project.admin.toString() === req.user._id.toString() ||
      project.members.some(m => 
        m.user.toString() === req.user._id.toString() && m.role === 'admin'
      );

    // Check if user is assigned to this task
    const isAssigned = 
      task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

    // User must be admin or assigned
    if (!isAdmin && !isAssigned) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    // Members can only update status
    if (!isAdmin && isAssigned) {
      task.status = req.body.status || task.status;
    } else {
      // Admins can update everything
      const { title, description, assignedTo, status, priority, dueDate } = req.body;
      
      if (title) task.title = title;
      if (description) task.description = description;
      if (assignedTo !== undefined) task.assignedTo = assignedTo;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate) task.dueDate = dueDate;
    }

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.json(task);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is admin of the project
    const project = await require('../models/Project').findById(task.project);
    const isAdmin = 
      project.admin.toString() === req.user._id.toString() ||
      project.members.some(m => 
        m.user.toString() === req.user._id.toString() && m.role === 'admin'
      );

    if (!isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 