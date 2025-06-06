// El routes lkoll leemha token 5ater el parametre auth
const express = require('express');
const router = express.Router(); 
const projectController = require('../controller/projects'); 
const auth = require('../middleware/authMiddleware');   
// ASna3 prj
router.post('/', auth, projectController.create);
// Chouf el projeyet
router.get('/', auth, projectController.findAll);
// chouf el prj bl id mte3ou
router.get('/:projectId', auth, projectController.findById);
// Badel fi prj
router.put('/:projectId', auth, projectController.update);
// Fassa5
router.delete('/:projectId', auth, projectController.delete);
module.exports = router;
