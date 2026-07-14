const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const VaultDocument = require('../models/VaultDocument');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');

// Multer Storage Configuration for Document Vault
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const cleanDocName = (req.body.documentName || 'document').replace(/[^a-zA-Z0-9]/g, '_');
    const targetUserId = req.body.employeeId || req.user.id;
    cb(null, `vault-${targetUserId}-${cleanDocName}-${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

// ================= Document Management =================

// @route   GET /api/vault/documents
// @desc    Get all vault documents (HR gets all company documents; Employees get only their own)
// @access  Private
router.get('/documents', protect, async (req, res) => {
  try {
    let docs;
    if (req.user.role === 'hr') {
      docs = await VaultDocument.find({}).sort({ updatedAt: -1 });
    } else {
      docs = await VaultDocument.find({ employeeId: req.user.id }).sort({ updatedAt: -1 });
    }
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/vault/documents/:id
// @desc    Get a single document and add a "View" log to audit trail
// @access  Private
router.get('/documents/:id', protect, async (req, res) => {
  try {
    const doc = await VaultDocument.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Role check
    if (req.user.role !== 'hr' && req.user.id !== doc.employeeId) {
      return res.status(403).json({ message: 'Not authorized to access this document' });
    }

    // Log the View action to audit trail
    doc.auditTrail.push({
      action: 'View',
      userId: req.user.id,
      userName: req.user.name,
      details: `Viewed document details of '${doc.documentName}'`
    });
    await doc.save();

    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/vault/documents/upload
// @desc    Upload new document or add a version to an existing document
// @access  Private
router.post('/documents/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { documentName, category, expiryDate, changeSummary } = req.body;
    // HR can upload on behalf of an employee by passing employeeId
    const employeeId = (req.user.role === 'hr' && req.body.employeeId) ? req.body.employeeId : req.user.id;

    if (!documentName) {
      return res.status(400).json({ message: 'Document name is required' });
    }

    const emp = await Employee.findOne({ id: employeeId });
    if (!emp) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const fileRelativePath = `uploads/${req.file.filename}`;
    
    // Check if employee already has a document with this name
    let doc = await VaultDocument.findOne({ employeeId, documentName });

    if (!doc) {
      // Create new document (Version 1)
      const versionObj = {
        versionNumber: 1,
        filePath: fileRelativePath,
        fileName: req.file.filename,
        uploadedBy: req.user.id,
        changeSummary: changeSummary || 'Initial upload'
      };

      const auditObj = {
        action: 'Upload',
        userId: req.user.id,
        userName: req.user.name,
        details: `Uploaded Version 1 of '${documentName}'`
      };

      doc = await VaultDocument.create({
        employeeId,
        employeeName: emp.name,
        documentName,
        category: category || 'Identity',
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        status: 'Pending Approval',
        versions: [versionObj],
        auditTrail: [auditObj]
      });

      // Synchronize in the old Employee documents map for compatibility
      if (!emp.documents) emp.documents = new Map();
      emp.documents.set(documentName, fileRelativePath);
      emp.markModified('documents');
      await emp.save();
    } else {
      // Add version to existing document
      const nextVersionNum = doc.versions.length + 1;
      const versionObj = {
        versionNumber: nextVersionNum,
        filePath: fileRelativePath,
        fileName: req.file.filename,
        uploadedBy: req.user.id,
        changeSummary: changeSummary || `Version ${nextVersionNum} update`
      };

      doc.versions.push(versionObj);
      doc.status = 'Pending Approval'; // Needs re-approval
      if (expiryDate !== undefined) {
        doc.expiryDate = expiryDate ? new Date(expiryDate) : undefined;
      }
      doc.expiryNotified = false; // Reset warning flags

      doc.auditTrail.push({
        action: 'Version Update',
        userId: req.user.id,
        userName: req.user.name,
        details: `Uploaded Version ${nextVersionNum} of '${documentName}'`
      });

      await doc.save();

      // Synchronize in the old Employee documents map
      if (!emp.documents) emp.documents = new Map();
      emp.documents.set(documentName, fileRelativePath);
      emp.markModified('documents');
      await emp.save();
    }

    // Trigger Notification for HR if uploaded by Employee
    if (req.user.role !== 'hr') {
      const notif = await Notification.create({
        type: 'reminder',
        title: 'New Document Uploaded',
        desc: `${emp.name} uploaded '${documentName}' for approval.`,
        empId: 'hr'
      });
      if (req.io) {
        req.io.to('hr').emit('notification', notif);
      }
    }

    res.json({ message: 'Document uploaded successfully', document: doc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/vault/documents/:id/approve
// @desc    Approve a document
// @access  Private/HR Only
router.put('/documents/:id/approve', protect, adminOnly, async (req, res) => {
  const { comments } = req.body;

  try {
    const doc = await VaultDocument.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    doc.status = 'Approved';
    doc.approvalWorkflow = {
      approvedBy: req.user.id,
      approvedByName: req.user.name,
      approvedAt: new Date(),
      comments: comments || 'Verified and Approved'
    };

    doc.auditTrail.push({
      action: 'Approve',
      userId: req.user.id,
      userName: req.user.name,
      details: `Approved document '${doc.documentName}'. Comments: ${comments || 'None'}`
    });

    await doc.save();

    // Notify target employee
    const notif = await Notification.create({
      type: 'reminder',
      title: 'Document Approved',
      desc: `Your document '${doc.documentName}' has been verified and approved by HR.`,
      empId: doc.employeeId
    });
    if (req.io) {
      req.io.to(doc.employeeId).emit('notification', notif);
    }

    res.json({ message: 'Document approved successfully', document: doc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/vault/documents/:id/reject
// @desc    Reject a document
// @access  Private/HR Only
router.put('/documents/:id/reject', protect, adminOnly, async (req, res) => {
  const { comments } = req.body;

  if (!comments) {
    return res.status(400).json({ message: 'Rejection comments are required' });
  }

  try {
    const doc = await VaultDocument.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    doc.status = 'Rejected';
    doc.approvalWorkflow = {
      approvedBy: req.user.id,
      approvedByName: req.user.name,
      approvedAt: new Date(),
      comments: comments
    };

    doc.auditTrail.push({
      action: 'Reject',
      userId: req.user.id,
      userName: req.user.name,
      details: `Rejected document '${doc.documentName}'. Comments/Reason: ${comments}`
    });

    await doc.save();

    // Notify employee
    const notif = await Notification.create({
      type: 'reminder',
      title: 'Document Rejected',
      desc: `Your document '${doc.documentName}' was rejected by HR: ${comments}`,
      empId: doc.employeeId
    });
    if (req.io) {
      req.io.to(doc.employeeId).emit('notification', notif);
    }

    res.json({ message: 'Document rejected successfully', document: doc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/vault/documents/:id/download/:versionNumber
// @desc    Download a specific file version of a document, adds a "Download" log to audit trail
// @access  Private
router.get('/documents/:id/download/:versionNumber', protect, async (req, res) => {
  try {
    const doc = await VaultDocument.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Role check
    if (req.user.role !== 'hr' && req.user.id !== doc.employeeId) {
      return res.status(403).json({ message: 'Not authorized to download this file' });
    }

    const versionNum = parseInt(req.params.versionNumber);
    const ver = doc.versions.find(v => v.versionNumber === versionNum);
    if (!ver) {
      return res.status(404).json({ message: `Version ${versionNum} not found` });
    }

    // Log the Download action to audit trail
    doc.auditTrail.push({
      action: 'Download',
      userId: req.user.id,
      userName: req.user.name,
      details: `Downloaded Version ${versionNum} file of '${doc.documentName}'`
    });
    await doc.save();

    // Send the file path relative or absolute
    const absolutePath = path.join(__dirname, '..', ver.filePath);
    if (fs.existsSync(absolutePath)) {
      res.download(absolutePath, ver.fileName);
    } else {
      res.status(404).json({ message: 'Physical file not found on disk' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= Expiry & Compliance Monitoring =================

// @route   GET /api/vault/expiries
// @desc    Get all expired documents or documents expiring in next 30 days
// @access  Private/HR Only
router.get('/expiries', protect, adminOnly, async (req, res) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringDocs = await VaultDocument.find({
      expiryDate: { $ne: null, $lte: thirtyDaysFromNow }
    }).sort({ expiryDate: 1 });

    res.json(expiringDocs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/vault/trigger-expiry-checks
// @desc    Trigger expiry monitoring and alert notification sweeps
// @access  Private/HR Only
router.post('/trigger-expiry-checks', protect, adminOnly, async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysVal = new Date();
    thirtyDaysVal.setDate(thirtyDaysVal.getDate() + 30);

    // Find all documents with expiry dates
    const docs = await VaultDocument.find({ expiryDate: { $ne: null } });
    let updatedCount = 0;

    for (let doc of docs) {
      const expDate = new Date(doc.expiryDate);
      let statusChanged = false;

      // Check if expired
      if (expDate <= today && doc.status !== 'Expired') {
        doc.status = 'Expired';
        statusChanged = true;
        
        doc.auditTrail.push({
          action: 'Expire',
          userId: 'system',
          userName: 'HRorbit System',
          details: `Document auto-marked as 'Expired' due to date passing: ${doc.expiryDate}`
        });

        // Notify employee
        const notif = await Notification.create({
          type: 'reminder',
          title: 'Document Expired',
          desc: `Your document '${doc.documentName}' has expired on ${expDate.toLocaleDateString()}. Please upload a new version.`,
          empId: doc.employeeId
        });
        if (req.io) {
          req.io.to(doc.employeeId).emit('notification', notif);
        }
      } 
      // Check if expiring in 30 days and not notified yet
      else if (expDate > today && expDate <= thirtyDaysVal && !doc.expiryNotified) {
        doc.expiryNotified = true;
        statusChanged = true;

        doc.auditTrail.push({
          action: 'Expiry Alert Triggered',
          userId: 'system',
          userName: 'HRorbit System',
          details: `Expiry alert triggered (Expiring soon on ${doc.expiryDate})`
        });

        // Notify employee
        const notif = await Notification.create({
          type: 'reminder',
          title: 'Document Expiring Soon',
          desc: `Your document '${doc.documentName}' is expiring soon on ${expDate.toLocaleDateString()}. Please prepare to upload a renewal.`,
          empId: doc.employeeId
        });
        if (req.io) {
          req.io.to(doc.employeeId).emit('notification', notif);
        }
      }

      if (statusChanged) {
        await doc.save();
        updatedCount++;
      }
    }

    res.json({ message: 'Compliance check completed successfully', checkedCount: docs.length, updatedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
