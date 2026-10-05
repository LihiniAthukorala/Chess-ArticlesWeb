const Article = require('../models/Article');
const User = require('../models/User');

const getDashboardStats = async (req, res) => {
  try {
    const [totalArticles, pendingReviews, publishedArticles, rejectedArticles, registeredUsers] = await Promise.all([
      Article.countDocuments(),
      Article.countDocuments({ status: 'pending_review' }),
      Article.countDocuments({ status: 'published' }),
      Article.countDocuments({ status: 'rejected' }),
      User.countDocuments()
    ]);

    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    const articlesThisMonth = await Article.countDocuments({
      createdAt: { $gte: currentMonthStart }
    });

    res.json({
      totalArticles,
      pendingReviews,
      publishedArticles,
      rejectedArticles,
      registeredUsers,
      articlesThisMonth
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load admin stats.' });
  }
};

const getPendingArticles = async (req, res) => {
  try {
    const articles = await Article.find({ status: 'pending_review' })
      .populate('author', 'name username email')
      .populate('category', 'name slug')
      .sort({ submittedAt: -1 });

    res.json({ articles });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load pending articles.' });
  }
};

const getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find().populate('author', 'name username').populate('category', 'name slug').sort({ createdAt: -1 });
    res.json({ articles });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load articles.' });
  }
};

const approveArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found.' });

    article.status = 'published';
    article.publishedAt = new Date();
    article.rejectionReason = '';
    article.adminFeedback = '';
    await article.save();

    res.json({ message: 'Article approved and published.', article });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to approve article.' });
  }
};

const rejectArticle = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found.' });

    article.status = 'rejected';
    article.rejectionReason = rejectionReason || 'Not approved for publication.';
    article.adminFeedback = rejectionReason || 'Not approved for publication.';
    await article.save();

    res.json({ message: 'Article rejected.', article });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to reject article.' });
  }
};

const requestChanges = async (req, res) => {
  try {
    const { adminFeedback } = req.body;
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found.' });

    article.status = 'changes_requested';
    article.adminFeedback = adminFeedback || 'Please revise the article and resubmit.';
    await article.save();

    res.json({ message: 'Changes requested from author.', article });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to request changes.' });
  }
};

module.exports = {
  getDashboardStats,
  getPendingArticles,
  getAllArticles,
  approveArticle,
  rejectArticle,
  requestChanges
};
