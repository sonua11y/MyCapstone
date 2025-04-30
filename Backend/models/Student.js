const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
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
  transactionId: {
    type: String,
    required: true,
    unique: true
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
  uploadDate: {
    type: String,
    required: true
  },
  dateOfPayment: {
    type: String,
    required: true
  },
    gender: String,
    fees: Number,
    year: Number,
    withdrawal: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
