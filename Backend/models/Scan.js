const mongoose = require('mongoose');
const scanSchema = new mongoose.Schema({
  type: { type: String, default: 'url' },
  input: { type: String, required: true },
  originalUrl: { type: String },
  finalUrl: { type: String },
  isShortened: { type: Boolean, default: false },
  redirectChain: { type: [String], default: [] },
  redirectCount: { type: Number, default: 0 },
  score: { type: Number, required: true },
  risk: { type: String, required: true },
  verdict: { type: String },
  modelUsed: { type: String },
  at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Scan', scanSchema);
