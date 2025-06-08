const db = require('../models');
const bcrypt = require('bcrypt');
const User = db.User;
const Project = db.Project;
const ProjectMember = db.ProjectMember;
const Task = db.Task;
exports.showProfile = async (req, res) => {
  const userId = req.session.user.id;
  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).send('User not found.');
    res.render('users/profile', {
      user,
      error: null,
      success: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading profile.');
  }
};
exports.updateProfile = async (req, res) => {
  const userId = req.session.user.id;
  const { firstName, lastName, email, password } = req.body;
  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).send('User not found.');
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    if (password && password.trim().length > 0) {
      user.password = await bcrypt.hash(password, 10);
    }
    await user.save();
    res.render('users/profile', {
      user,
      error: null,
      success: 'Profile updated successfully!',
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('users/profile', {
      user: req.body,
      error: 'Error updating profile.',
      success: null,
    });
  }
};
exports.adminDashboard = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'username', 'role'],
      include: [
        {
          model: Project,
          as: 'projects',
          attributes: ['id', 'title', 'status'],
          through: {
            attributes: ['role'],
          },
        },
        {
          model: Task,
          as: 'tasks',
          attributes: ['id', 'title', 'status'],
        },
      ],
    });
    const projects = await Project.findAll({
      attributes: ['id', 'title', 'description', 'status', 'createdAt'],
      include: [
        {
          model: ProjectMember,
          as: 'memberships',
          include: [
            {
              model: User,
              attributes: ['id', 'firstName', 'lastName', 'email', 'username'],
              as: 'user',
            },
          ],
        },
        {
          model: Task,
          as: 'tasks',
          include: [
            {
              model: User,
              attributes: ['id', 'firstName', 'lastName', 'username'],
              as: 'assignee',
            },
          ],
        },
      ],
    });
    res.render('admin/dashboard', {
      users,
      projects,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading admin dashboard.');
  }
};
