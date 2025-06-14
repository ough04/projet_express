const { User } = require('../models');
const bcrypt = require('bcrypt');
exports.getProfile = async (req, res) => {
  try {
    const userFull = await User.findByPk(req.user.id);
    if (!userFull) return res.redirect('/login');

    res.render('profile', { user: userFull });
  } catch (error) {
    console.error('Error loading profile:', error);
    res.status(500).send('Internal server error');
  }
};
// Ybadel fl profile mt3 el user (moula el compte)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, email, username, password } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).send('User not found');

    user.first_name = first_name || user.first_name;
    user.last_name = last_name || user.last_name;
    user.email = email || user.email;
    user.username = username || user.username;

    await user.save();
    return res.redirect('/dashboard');
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).send('Internal server error');
  }
};
// Ye5ou el users lkoll
exports.getAllUsers = async (req, res) => {
  try {
    if (!req.user.is_super_admin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = await User.findAll({
      attributes: ['id', 'username', 'first_name', 'last_name', 'email', 'is_super_admin'],
    });

    return res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
// Ye5ou el user bl id mte3ou
exports.getUserById = async (req, res) => {
  try {
    if (!req.user.is_super_admin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { userId } = req.params;
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'first_name', 'last_name', 'email', 'is_super_admin'],
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
// ybadel fl user
exports.updateUserById = async (req, res) => {
  try {
    if (!req.user.is_super_admin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { userId } = req.params;
    const { first_name, last_name, email, password, is_super_admin } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (first_name !== undefined) user.first_name = first_name;
    if (last_name !== undefined) user.last_name = last_name;
    if (email !== undefined) user.email = email;
    if (is_super_admin !== undefined) user.is_super_admin = is_super_admin;

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      user.password_hash = hashed;
    }

    await user.save();
    return res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
// Yfasa5 el user 
exports.deleteUserById = async (req, res) => {
  try {
    if (!req.user.is_super_admin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { userId } = req.params;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.destroy();
    return res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
