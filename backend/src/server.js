require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const User = require('./models/User');
const Category = require('./models/Category');
const Article = require('./models/Article');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Ceylon Chess API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);

const seedIfNeeded = async () => {
  try {
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@chesschronicle.com' });
    if (!adminExists) {
      const admin = await User.create({
        name: 'Admin User',
        username: 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@chesschronicle.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@123',
        role: 'admin',
        country: 'Global',
        bio: 'Editorial administrator'
      });

      console.log(`Seeded admin: ${admin.email}`);
    }

    const categoriesCount = await Category.countDocuments();
    if (categoriesCount === 0) {
      const defaultCategories = [
        { name: 'Openings', slug: 'openings', description: 'Opening repertoires and ideas', icon: '♟️', displayOrder: 1 },
        { name: 'Middlegame', slug: 'middlegame', description: 'Strategic and tactical middlegame themes', icon: '♜', displayOrder: 2 },
        { name: 'Endgame', slug: 'endgame', description: 'Pawn races, technique, and conversion', icon: '♛', displayOrder: 3 },
        { name: 'Tactics', slug: 'tactics', description: 'Calculation and tactical motifs', icon: '⚡', displayOrder: 4 },
        { name: 'Strategy', slug: 'strategy', description: 'Planning and positional concepts', icon: '🧠', displayOrder: 5 },
        { name: 'Chess Psychology', slug: 'chess-psychology', description: 'Mindset and practical decision making', icon: '🧭', displayOrder: 6 },
        { name: 'Tournament Reports', slug: 'tournament-reports', description: 'Reports and round-by-round stories', icon: '🏆', displayOrder: 7 },
        { name: 'Chess History', slug: 'chess-history', description: 'Legacy games and historical context', icon: '📜', displayOrder: 8 }
      ];

      await Category.insertMany(defaultCategories);
      console.log('Seeded categories');
    }

    const articleCount = await Article.countDocuments();
    if (articleCount === 0) {
      const user = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@chesschronicle.com' });
      const catMap = await Category.find();
      const categoriesByName = Object.fromEntries(catMap.map((c) => [c.name, c._id]));

      const sampleArticles = [
        { title: 'The Hidden Ideas Behind the Queen\'s Gambit', subtitle: 'A strategic guide to modern pawn structures', excerpt: 'Why the Queen\'s Gambit remains one of the most instructive strategic openings ever played.', content: 'The Queen\'s Gambit is more than a pawn grab. It creates long-term tension. White aims to challenge central control without committing too early...', category: categoriesByName['Openings'], tags: ['Queen\'s Gambit', 'Strategy'], author: user._id, status: 'published', publishedAt: new Date(), views: 240, readingTime: 7 },
        { title: 'How to Improve Your Endgame Technique', subtitle: 'Practical plans for converting advantages', excerpt: 'Use fundamental endgame principles to turn small edges into wins.', content: 'In endgames, the first question is usually not what is the best move but what is the correct plan...', category: categoriesByName['Endgame'], tags: ['Endgame', 'Technique'], author: user._id, status: 'published', publishedAt: new Date(), views: 190, readingTime: 8 },
        { title: '5 Tactical Patterns Every Player Should Know', subtitle: 'From forks to discovered attacks', excerpt: 'Understanding recurring tactical motifs sharpens your calculation under time pressure.', content: 'The most reliable tactical tools can be reduced to a set of recurring patterns...', category: categoriesByName['Tactics'], tags: ['Tactics', 'Calculation'], author: user._id, status: 'published', publishedAt: new Date(), views: 320, readingTime: 6 },
        { title: 'The Psychology of the Middlegame', subtitle: 'Keeping calm when the position becomes chaotic', excerpt: 'A stable mindset helps players evaluate positions more accurately.', content: 'The middlegame is where many games are decided not by theory but by psychology...', category: categoriesByName['Middlegame'], tags: ['Strategy', 'Psychology'], author: user._id, status: 'published', publishedAt: new Date(), views: 210, readingTime: 6 },
        { title: 'Modern Chess Training For Busy Adults', subtitle: 'A realistic plan for improvement', excerpt: 'Consistency matters more than the number of hours on the board.', content: 'Playing more chess is not the same as training more chess...', category: categoriesByName['Chess History'], tags: ['Training', 'Planning'], author: user._id, status: 'published', publishedAt: new Date(), views: 150, readingTime: 7 }
      ];

      await Article.insertMany(sampleArticles.map((article) => ({
        ...article,
        slug: article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        seoTitle: article.title,
        seoDescription: article.excerpt,
        featuredImage: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d',
        createdAt: new Date(),
        updatedAt: new Date()
      })));

      console.log('Seeded sample published articles');
    }
  } catch (error) {
    console.error('Seed check failed:', error.message);
  }
};

const startServer = async () => {
  try {
    await connectDB();
    await seedIfNeeded();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
