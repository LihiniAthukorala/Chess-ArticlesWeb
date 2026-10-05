const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  subtitle: { type: String, default: '' },
  excerpt: { type: String, default: '' },
  content: { type: String, default: '' },
  featuredImage: { type: String, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  tags: [{ type: String }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['draft', 'pending_review', 'changes_requested', 'published', 'rejected', 'archived'],
    default: 'draft'
  },
  rejectionReason: { type: String, default: '' },
  adminFeedback: { type: String, default: '' },
  views: { type: Number, default: 0 },
  readingTime: { type: Number, default: 5 },
  seoTitle: { type: String, default: '' },
  seoDescription: { type: String, default: '' },
  fen: { type: String, default: '' },
  pgn: { type: String, default: '' },
  submittedAt: { type: Date, default: null },
  publishedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

articleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Article', articleSchema);
