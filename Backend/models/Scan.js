const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  type: { type: String, default: 'url' },
  input: { type: String, required: true },
  score: { type: Number, required: true },
  risk: { type: String, required: true },
  verdict: { type: String },
  modelUsed: { type: String },
  at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Scan', scanSchema);
