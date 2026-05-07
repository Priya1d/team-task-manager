const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const { checkProjectAccess } = require('../middleware/checkProjectAccess');

// @route   GET /api/dashboard/:projectId
// @desc    Get dashboard statistics for a project
// @access  Private
router.get('/:projectId', auth, checkProjectAccess, async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // Count total tasks
    const totalTasks = await Task.countDocuments({ project: projectId });

    // Count tasks by status
    const todoTasks = await Task.countDocuments({ 
      project: projectId, 
      status: 'todo' 
    });
    
    const inProgressTasks = await Task.countDocuments({ 
      project: projectId, 
      status: 'in_progress' 
    });
    
    const doneTasks = await Task.countDocuments({ 
      project: projectId, 
      status: 'done' 
    });

    // Count overdue tasks (due date passed and not done)
    const overdueTasks = await Task.countDocuments({
      project: projectId,
      dueDate: { $lt: new Date() },  // Less than current date
      status: { $ne: 'done' }         // Not equal to 'done'
    });

    // Get tasks grouped by user (using aggregation)
    const tasksPerUser = await Task.aggregate([
      // Stage 1: Filter by project
      { 
        $match: { 
          project: new mongoose.Types.ObjectId(projectId)
        } 
      },
      
      // Stage 2: Group by assignedTo and count
      { 
        $group: {
          _id: '$assignedTo',
          count: { $sum: 1 }
        }
      },
      
      // Stage 3: Join with users collection
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      
      // Stage 4: Unwind user array
      { $unwind: '$user' },
      
      // Stage 5: Format output
      {
        $project: {
          userId: '$_id',
          name: '$user.name',
          email: '$user.email',
          count: 1
        }
      }
    ]);

    // Get tasks grouped by priority
    const tasksByPriority = await Task.aggregate([
      { $match: { project: new mongoose.Types.ObjectId(projectId) } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Send response
    res.json({
      totalTasks,
      tasksByStatus: {
        todo: todoTasks,
        inProgress: inProgressTasks,
        done: doneTasks
      },
      overdueTasks,
      tasksPerUser,
      tasksByPriority
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 