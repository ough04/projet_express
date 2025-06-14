const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
// Yapliki el ath middleware 3la el routes lkoll
router.use(authMiddleware);
// El routes mt3 el user
router.get('/me', userController.getProfile);          
router.put('/me', userController.updateProfile);       
router.get('/', userController.getAllUsers);           
router.get('/:userId', userController.getUserById);    
router.put('/:userId', userController.updateUserById); 
router.delete('/:userId', userController.deleteUserById);
module.exports = router;
