const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkProjectManager } = require('../middleware/roleMiddleware');
const verifyPageToken = require('../middleware/pageAuth');
const checkSuperAdmin = require('../middleware/checkSuperAdmin');
// Yapliki el ath middleware 3la el routes lkoll
router.use(authMiddleware);
// Yasna3 prj
router.post('/', projectController.createProject);
// tbadel fi prj
router.put('/:projectId', checkProjectManager, projectController.updateProject);
// Yzid member
router.post('/:projectId/members', checkProjectManager, projectController.addMember);
// Yfasa5 member
router.delete('/:projectId', checkProjectManager, projectController.deleteProject);
module.exports = router;
