const { Project, ProjectMember, User, Task } = require('../models');
// Ygeneraty fl panel t3 l admin
exports.admin = async (req, res) => {
  try {
    // Ye5ou fl users lkoll
    const users = await User.findAll();
    // Ye5ou fl projects lkoll bl members mte3hom
    const projects = await Project.findAll({
      include: [
        {
          model: ProjectMember,
          as: 'memberships',
          include: [{ model: User, as: 'user' }],
        },
      ],
    });
    // Ye5ou fl tasks lkoll
    const tasks = await Task.findAll();
    // Ygeneraty fl page admin
    res.render('admin', {
      user: req.user,  
      users,
      projects,
      tasks,
    });
  } catch (error) {
    console.error('Error loading admin page:', error);
    res.status(500).send('Internal server error');
  }
};
