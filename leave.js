const express = require('express');
const router = express.Router();
const LeaveRequest = require('../models/LeaveRequest');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');

// @route   POST /api/leave
// @desc    Create a new leave request
// @access  Private (students only)
router.post('/', auth, authorize('student'), async (req, res) => {
  try {
    const { fromDate, toDate, fromTime, toTime, reason, leaveType } = req.body;
    
    if (!leaveType) {
      return res.status(400).json({ message: 'Leave type is required' });
    }
    
    const newLeaveRequest = new LeaveRequest({
      studentId: req.user._id,
      studentName: req.user.name,
      fromDate,
      toDate,
      fromTime: fromTime || '08:00',
      toTime: toTime || '17:00',
      reason,
      leaveType
    });
    
    const leaveRequest = await newLeaveRequest.save();
    res.status(201).json(leaveRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/leave
// @desc    Get leave requests based on role
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let leaveRequests;
    
    switch (req.user.role) {
      case 'student':
        // Students can only see their own leave requests
        leaveRequests = await LeaveRequest.find({ studentId: req.user._id }).sort({ createdAt: -1 });
        break;
      
      case 'parent':
      case 'admin':
        // Parents and admins can see all leave requests
        leaveRequests = await LeaveRequest.find().sort({ createdAt: -1 });
        break;
      
      default:
        return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/leave/:id
// @desc    Get a single leave request
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);
    
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    // Students can only view their own leave requests
    if (req.user.role === 'student' && leaveRequest.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(leaveRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/leave/:id
// @desc    Update leave request status
// @access  Private (parents and admins only)
router.put('/:id', auth, authorize('parent', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    let leaveRequest = await LeaveRequest.findById(req.params.id);
    
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    const updateData = {
      updatedAt: Date.now()
    };
    
    // Update specific approval based on role
    if (req.user.role === 'parent') {
      updateData.parentApproval = status === 'approved';
    } else if (req.user.role === 'admin') {
      updateData.adminApproval = status === 'approved';
    }
    
    // If either parent or admin rejects, update overall status to rejected
    if (status === 'rejected') {
      updateData.status = 'rejected';
      updateData.finalApproval = false;
    } else {
      // Check if we can set as fully approved
      const willBeFullyApproved = 
        (req.user.role === 'parent' && status === 'approved' && leaveRequest.adminApproval) ||
        (req.user.role === 'admin' && status === 'approved' && leaveRequest.parentApproval);
      
      if (willBeFullyApproved) {
        updateData.status = 'approved';
        updateData.finalApproval = true;
      } else {
        // Keep as pending until both approve
        updateData.status = 'pending';
      }
    }
    
    leaveRequest = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    
    res.json(leaveRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
