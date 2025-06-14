const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
// Tasna3 user jdid
router.post('/register', authController.register);
// Tod5ol b compte mawjoud fl bd
router.post('/login', authController.login);
module.exports = router;
