require('dotenv').config();
const { connectDB } = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');
const Article = require('./models/Article');

const seed = async () => {
  await connectDB();

  const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@chesschronicle.com' });
  if (!adminExists) {
    await User.create({
      name: 'Admin User',
      username: 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@chesschronicle.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'admin',
      country: 'Global',
      bio: 'Editorial administrator'
    });
  }

  const categoryCount = await Category.countDocuments();
  if (categoryCount === 0) {
    const defaultCategories = [
      { name: 'Openings', slug: 'openings', description: 'Opening repertoires', icon: '♟️', displayOrder: 1 },
      { name: 'Middlegame', slug: 'middlegame', description: 'Middle-game ideas', icon: '♜', displayOrder: 2 },
      { name: 'Endgame', slug: 'endgame', description: 'Technique and conversion', icon: '♛', displayOrder: 3 },
      { name: 'Tactics', slug: 'tactics', description: 'Calculation motifs', icon: '⚡', displayOrder: 4 },
      { name: 'Strategy', slug: 'strategy', description: 'Plans and ideas', icon: '🧠', displayOrder: 5 },
      { name: 'Chess Psychology', slug: 'chess-psychology', description: 'Mental approach', icon: '🧭', displayOrder: 6 },
      { name: 'Tournament Reports', slug: 'tournament-reports', description: 'On-site stories', icon: '🏆', displayOrder: 7 },
      { name: 'Chess History', slug: 'chess-history', description: 'Classic games', icon: '📜', displayOrder: 8 }
    ];

    await Category.insertMany(defaultCategories);
  }

  const articleCount = await Article.countDocuments();
  if (articleCount === 0) {
    const adminUser = await User.findOne({ role: 'admin' });
    const categories = await Category.find();
    const byName = Object.fromEntries(categories.map((category) => [category.name, category._id]));

    await Article.insertMany([
      {
        title: "The Hidden Ideas Behind the Queen's Gambit",
        slug: 'the-hidden-ideas-behind-the-queens-gambit',
        subtitle: 'A strategic guide to modern pawn structures',
        excerpt: 'Why the Queen\'s Gambit remains one of the most instructive strategic openings ever played.',
        content: '<h2>Strategic Foundation</h2><p>White builds a strong central presence...</p>',
        featuredImage: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d',
        category: byName['Openings'],
        tags: ['Queen\'s Gambit', 'Strategy'],
        author: adminUser._id,
        status: 'published',
        views: 240,
        readingTime: 7,
        seoTitle: "The Hidden Ideas Behind the Queen's Gambit",
        seoDescription: 'A strategic guide to modern pawn structures.',
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'How to Improve Your Endgame Technique',
        slug: 'how-to-improve-your-endgame-technique',
        subtitle: 'Practical plans for converting advantages',
        excerpt: 'Use fundamental endgame principles to turn small edges into wins.',
        content: '<h2>Endgame Basics</h2><p>When the queens are gone...</p>',
        featuredImage: 'https://images.unsplash.com/photo-1528819622761-6bcf9a5d3d4a',
        category: byName['Endgame'],
        tags: ['Endgame', 'Technique'],
        author: adminUser._id,
        status: 'published',
        views: 190,
        readingTime: 8,
        seoTitle: 'How to Improve Your Endgame Technique',
        seoDescription: 'Endgame technique guide and practical plans.',
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  }

  console.log('Seed complete.');
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
