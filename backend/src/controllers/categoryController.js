const Category = require('../models/Category');
const Article = require('../models/Article');

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1, name: 1 });

    const mapped = await Promise.all(categories.map(async (category) => {
      const count = await Article.countDocuments({ category: category._id, status: 'published' });
      return { ...category.toObject(), articleCount: count };
    }));

    res.json({ categories: mapped });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load categories.' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description, image, icon, displayOrder } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const category = await Category.create({
      name,
      slug,
      description,
      image,
      icon,
      displayOrder
    });

    res.status(201).json({ category });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create category.' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found.' });

    Object.assign(category, req.body);
    await category.save();
    res.json({ category });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update category.' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found.' });

    await category.deleteOne();
    res.json({ message: 'Category deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to delete category.' });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
