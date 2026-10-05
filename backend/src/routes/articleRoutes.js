const express = require('express');
const { listPublishedArticles, getArticleBySlug, createArticle, updateArticle, submitArticle, deleteArticle, getUserArticles } = require('../controllers/articleController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', listPublishedArticles);
router.get('/me', authMiddleware, getUserArticles);
router.get('/:slug', getArticleBySlug);
router.post('/', authMiddleware, createArticle);
router.put('/:id', authMiddleware, updateArticle);
router.delete('/:id', authMiddleware, deleteArticle);
router.post('/:id/submit', authMiddleware, submitArticle);

module.exports = router;
