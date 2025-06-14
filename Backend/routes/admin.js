const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const verifyPageToken = require('../middleware/pageAuth');
const checkSuperAdmin = require('../middleware/checkSuperAdmin');
// El router mt3 admin (lezemha ath mt3 role)
router.get('/admin', verifyPageToken, checkSuperAdmin, adminController.admin);
module.exports = router;
