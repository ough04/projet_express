const express = require('express');
const router = express.Router();
const userController = require('../controller/users');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');
router.get('/', isAuthenticated, userController.showProfile);
router.post('/update', isAuthenticated, userController.updateProfile);
router.get('/admin', isAuthenticated, isAdmin, userController.adminDashboard);
module.exports = router;
