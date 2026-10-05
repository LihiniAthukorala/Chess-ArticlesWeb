const express = require('express');
const { getDashboardStats, getPendingArticles, getAllArticles, approveArticle, rejectArticle, requestChanges } = require('../controllers/adminController');
const { authMiddleware, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware, requireAdmin);
router.get('/stats', getDashboardStats);
router.get('/articles/pending', getPendingArticles);
router.get('/articles', getAllArticles);
router.post('/articles/:id/approve', approveArticle);
router.post('/articles/:id/reject', rejectArticle);
router.post('/articles/:id/request-changes', requestChanges);

module.exports = router;
