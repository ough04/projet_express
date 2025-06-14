const express = require('express');
const router = express.Router();
const { Project, ProjectMember, User, Task } = require('../models');
const verifyPageToken = require('../middleware/pageAuth');
const projectController = require('../controllers/projectController');
const members = require('../controllers/members');
const taskcontroller = require('../controllers/taskController');
const usercontroller = require('../controllers/userController');
// El routes mt3 koll page
router.get('/dashboard', verifyPageToken, projectController.dash);
router.get('/projects', verifyPageToken, projectController.projects);
router.get('/login', (req, res) => {
  res.render('login');
});
router.get('/register', (req, res) => {
  res.render('register');
});
router.get('/projects/new', verifyPageToken, (req, res) => {
  res.render('project-new', { user: req.user });
});
router.get('/projects/:id', verifyPageToken, projectController.showprojectsbyid);
router.get('/projects/:id/edit', verifyPageToken, projectController.editproject);
router.get('/projects/:id/members', verifyPageToken, members.showMembers);
router.get('/tasks/new', verifyPageToken, taskcontroller.addTask);
router.get('/tasks/:id', verifyPageToken, taskcontroller.updateTask);
router.get('/tasks/:id/edit', verifyPageToken, taskcontroller.updateTask);
router.get('/tasks', verifyPageToken, taskcontroller.getTasks);
router.get('/profile', verifyPageToken, usercontroller.getProfile);
// EL logout (yfasa5 el token)
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});
module.exports = router;
