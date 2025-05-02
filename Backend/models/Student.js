const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  'Upload date': {
    type: String,
    required: false
  },
  'Date of payment': {
    type: String,
    required: false
  },
  'Transaction id': {
    type: String,
    required: false,
    index: { unique: true, sparse: true }
  },
  'First Name': {
    type: String,
    required: false
  },
  'Last Name': {
    type: String,
    required: false
  },
  'College': {
    type: String,
    required: false
  },
  '10K': {
    type: String,
    enum: ['Yes', 'No', 'yes', 'no', 'YES', 'NO'],
    required: false
  },
  'Sem Fee': {
    type: String,
    enum: ['Yes', 'No', 'yes', 'no', 'YES', 'NO'],
    required: false
  },
  'Gender': {
    type: String
  },
  'Fees': {
    type: String
  },
  'Year': {
    type: Number
  },
  'Withdrawal': {
    type: String
  }
}, {
  timestamps: true,
  collection: 'students'
});

module.exports = mongoose.model('Student', studentSchema);
