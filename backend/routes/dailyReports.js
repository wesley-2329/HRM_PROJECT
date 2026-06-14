const express = require('express');
const router = express.Router();
const DailyReport = require('../models/DailyReport');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @route   GET /api/daily-reports
// @desc    Get reports based on role (HR: all, Lead: received + sent, Employee: sent)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let reports;
    if (req.user.role === 'hr') {
      reports = await DailyReport.find({}).sort({ createdAt: -1 });
    } else if (req.user.isTeamLead) {
      reports = await DailyReport.find({
        $or: [
          { teamLeadId: req.user.id },
          { empId: req.user.id }
        ]
      }).sort({ createdAt: -1 });
    } else {
      reports = await DailyReport.find({ empId: req.user.id }).sort({ createdAt: -1 });
    }
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/daily-reports
// @desc    Submit a daily report to the employee's team lead
// @access  Private
router.post('/', protect, async (req, res) => {
  const { date, tasksCompleted, blockers, hoursWorked } = req.body;

  try {
    // Fetch employee's current team lead
    const employee = await Employee.findOne({ id: req.user.id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const teamLeadId = employee.teamLeadId || '';

    const report = await DailyReport.create({
      empId: req.user.id,
      empName: req.user.name,
      empEmail: req.user.email,
      teamLeadId,
      date,
      tasksCompleted,
      blockers: blockers || '',
      hoursWorked: hoursWorked || 8,
      status: 'Pending Review'
    });

    // Notify the Team Lead if one is assigned
    if (teamLeadId) {
      const notif = await Notification.create({
        type: 'reminder',
        title: 'New Daily Report',
        desc: `${req.user.name} submitted a daily report for ${date}.`,
        empId: teamLeadId
      });
      req.io.to(teamLeadId).emit('notification', notif);
    }

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/daily-reports/:id/review
// @desc    Submit a review for a daily report (Team Lead or HR only)
// @access  Private
router.put('/:id/review', protect, async (req, res) => {
  const { reviewFeedback } = req.body;

  try {
    const report = await DailyReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Daily report not found' });
    }

    const isDesignatedLead = report.teamLeadId === req.user.id;
    const isHr = req.user.role === 'hr';

    if (!isDesignatedLead && !isHr) {
      return res.status(403).json({ message: 'Not authorized to review this report' });
    }

    report.reviewFeedback = reviewFeedback || '';
    report.status = 'Reviewed';
    report.reviewedBy = req.user.name;

    const updatedReport = await report.save();

    // Notify employee of report review
    const notif = await Notification.create({
      type: 'reminder',
      title: 'Daily Report Reviewed',
      desc: `Your daily report for ${report.date} was reviewed by ${req.user.name}.`,
      empId: report.empId
    });
    req.io.to(report.empId).emit('notification', notif);

    res.json(updatedReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
