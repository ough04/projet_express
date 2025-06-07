const express = require('express');
const router = express.Router(); 
const member = require('../controller/project_members.js'); 
const auth = require('../middleware/authMiddleware.js');    
// El routes lkoll lezemha token
router.use(auth);
// Zid member
router.post('/:projectId/add', member.addMember);
// Badel fi member
router.put('/:projectId/:memberId/role', member.updateRole);
// Fassa5 member
router.delete('/:projectId/:memberId', member.removeMember);
// Chouf el members lkoll
router.get('/:projectId', member.listMembers);
module.exports = router;
