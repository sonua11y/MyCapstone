const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  uploadDate: {
    type: String,
    required: true
  },
  dateOfPayment: {
    type: String,
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    index: { unique: true, sparse: true }
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  college: {
    type: String,
    required: true
  },
  feePaid: {
    type: String,
    enum: ['Yes', 'No'],
    required: true
  },
  semFee: {
    type: String,
    enum: ['Yes', 'No'],
    required: true
  },
  gender: {
    type: String
  },
  fees: {
    type: String
  },
  year: {
    type: Number
  },
  withdrawal: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
