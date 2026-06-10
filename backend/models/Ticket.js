const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low'
  },
  status: {
    type: String,
    enum: ['Open', 'Closed'],
    default: 'Open'
  },
  raisedOn: {
    type: String,
    required: true
  },
  response: {
    type: String,
    default: ''
  },
  empId: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', TicketSchema);
