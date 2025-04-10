
const mongoose = require('mongoose');

const LeaveRequestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  leaveType: {
    type: String,
    enum: ['home_leave', 'one_day_leave', 'medical_leave', 'emergency_leave', 'other'],
    required: true
  },
  fromDate: {
    type: Date,
    required: true
  },
  toDate: {
    type: Date,
    required: true
  },
  fromTime: {
    type: String,
    default: '08:00'
  },
  toTime: {
    type: String,
    default: '17:00'
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  parentApproval: {
    type: Boolean,
    default: false
  },
  adminApproval: {
    type: Boolean,
    default: false
  },
  finalApproval: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add a pre-save middleware to update finalApproval status
LeaveRequestSchema.pre('save', function(next) {
  // If both parent and admin have approved, set finalApproval to true
  if (this.parentApproval && this.adminApproval) {
    this.finalApproval = true;
    this.status = 'approved';
  } else if (this.status === 'rejected') {
    // If rejected by either party, ensure finalApproval is false
    this.finalApproval = false;
  }
  next();
});

module.exports = mongoose.model('LeaveRequest', LeaveRequestSchema);
