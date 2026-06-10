const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

// @route   GET /api/tasks
// @desc    Get all tasks
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'hr') {
      tasks = await Task.find({});
    } else {
      tasks = await Task.find({ empId: req.user.id });
    }
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/tasks
// @desc    Create a task
// @access  Private
router.post('/', protect, async (req, res) => {
  const { title, project, priority, due, progress, status, empId } = req.body;

  try {
    // If not HR, auto-assign to self
    const assignedEmpId = req.user.role === 'hr' ? (empId || '') : req.user.id;

    const task = await Task.create({
      title,
      project,
      priority,
      due,
      progress: progress || 0,
      status: status || 'todo',
      empId: assignedEmpId
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task status or progress
// @access  Private
router.put('/:id', protect, async (req, res) => {
  const { status, progress, title, project, priority, due } = req.body;

  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify ownership or HR role
    if (req.user.role !== 'hr' && task.empId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to modify this task' });
    }

    task.status = status || task.status;
    if (progress !== undefined) {
      task.progress = progress;
    }
    
    if (req.user.role === 'hr') {
      task.title = title || task.title;
      task.project = project || task.project;
      task.priority = priority || task.priority;
      task.due = due || task.due;
    }

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify HR role or owner delete
    if (req.user.role !== 'hr' && task.empId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Task.deleteOne({ _id: req.params.id });
    res.json({ message: 'Task removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
