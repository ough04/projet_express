const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkProjectManager, checkProjectMemberOrManager } = require('../middleware/roleMiddleware');
// Yapliki el ath middleware 3la el routes lkoll
router.use(authMiddleware);
// Ye5ou el tasks lkoll
router.get('/', taskController.getTasks);
// Ye5ou el task bl id mte3ja
router.get('/:taskId', authMiddleware, taskController.getTaskById);
// Yasna3 task
router.post('/', authMiddleware, taskController.createTask);
// Ybadel fi task
router.put('/:taskId', authMiddleware, taskController.edit);
// Yfasakh task
router.delete('/:taskId', checkProjectManager, taskController.deleteTask);
module.exports = router;
