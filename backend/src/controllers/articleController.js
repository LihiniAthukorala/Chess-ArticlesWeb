const Article = require('../models/Article');
const Category = require('../models/Category');
const User = require('../models/User');

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const getReadingTime = (content) => {
  const words = (content || '').split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.ceil(words / 220));
};

const listPublishedArticles = async (req, res) => {
  try {
    const { category, author, search, sort = 'newest' } = req.query;
    const filter = { status: 'published' };

    if (category) filter.category = category;
    if (author) filter.author = author;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sortMap = {
      newest: { createdAt: -1 },
      popular: { views: -1 }
    };

    const articles = await Article.find(filter)
      .populate('author', 'name username profileImage')
      .populate('category', 'name slug')
      .sort(sortMap[sort] || sortMap.newest)
      .limit(30);

    res.json({ articles });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load articles.' });
  }
};

const getArticleBySlug = async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug }).populate('author', 'name username profileImage bio country').populate('category', 'name slug');

    if (!article || article.status !== 'published') {
      return res.status(404).json({ message: 'Article not found.' });
    }

    article.views += 1;
    await article.save();

    res.json({ article });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load article.' });
  }
};

const createArticle = async (req, res) => {
  try {
    const { title, subtitle, excerpt, content, category, tags, featuredImage, seoTitle, seoDescription, fen, pgn } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    const baseSlug = slugify(title);
    const slug = `${baseSlug}-${Date.now().toString().slice(-6)}`;

    const article = await Article.create({
      title,
      slug,
      subtitle,
      excerpt,
      content,
      category,
      tags: tags || [],
      featuredImage,
      author: req.user._id,
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || excerpt || 'Chess article',
      fen,
      pgn,
      readingTime: getReadingTime(content),
      status: 'draft'
    });

    res.status(201).json({ article });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create article.' });
  }
};

const updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found.' });
    }

    if (article.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only edit your own articles.' });
    }

    const updates = req.body;
    if (updates.title) {
      article.slug = `${slugify(updates.title)}-${Date.now().toString().slice(-6)}`;
    }
    if (updates.content) {
      article.readingTime = getReadingTime(updates.content);
    }

    Object.assign(article, updates);
    await article.save();

    res.json({ article });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update article.' });
  }
};

const submitArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found.' });
    }

    if (article.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only submit your own article.' });
    }

    article.status = 'pending_review';
    article.submittedAt = new Date();
    article.rejectionReason = '';
    article.adminFeedback = '';
    await article.save();

    res.json({ message: 'Your article has been submitted successfully. It will be reviewed by our editorial team before publication.', article });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to submit article.' });
  }
};

const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found.' });
    }

    if (article.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You cannot delete this article.' });
    }

    await article.deleteOne();
    res.json({ message: 'Article deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to delete article.' });
  }
};

const getUserArticles = async (req, res) => {
  try {
    const articles = await Article.find({ author: req.user._id }).sort({ updatedAt: -1 }).populate('category', 'name slug');
    res.json({ articles });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load articles.' });
  }
};

module.exports = {
  listPublishedArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  submitArticle,
  deleteArticle,
  getUserArticles
};
