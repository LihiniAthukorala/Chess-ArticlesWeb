const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'dev-secret', {
  expiresIn: '7d'
});

const register = async (req, res) => {
  try {
    const { name, username, email, password, country, chessTitle, fideId, bio } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with that email or username already exists.' });
    }

    const user = await User.create({
      name,
      username,
      email,
      password,
      country,
      chessTitle,
      fideId,
      bio
    });

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        country: user.country,
        chessTitle: user.chessTitle,
        fideId: user.fideId,
        bio: user.bio,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to register user.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        country: user.country,
        chessTitle: user.chessTitle,
        fideId: user.fideId,
        bio: user.bio,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to log in.' });
  }
};

const getMe = async (req, res) => {
  res.json({ user: req.user });
};

const forgotPassword = async (req, res) => {
  res.json({ message: 'Password reset is not configured yet.' });
};

const resetPassword = async (req, res) => {
  res.json({ message: 'Password reset is not configured yet.' });
};

module.exports = { register, login, getMe, forgotPassword, resetPassword };
