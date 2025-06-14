const db = require('../models');
const { User, Project, ProjectMember } = db;
// Ywarri el page mt3 project mou3ayen
exports.showMemberManagement = async (req, res) => {
  const projectId = req.params.projectId;
  try {
    // Ye5ou f projet bl members w roles mte3hom
    const project = await Project.findByPk(projectId, {
      include: {
        model: User,
        as: 'members',
        through: { attributes: ['role'] },
      },
    });
    if (!project) return res.status(404).send('Project not found.');
    // Y generaty fl view
    res.render('projects/manage-members', {
      projectId,
      members: project.members,
      error: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading members.');
  }
};
// Yzid f member lel prj
exports.addMember = async (req, res) => {
  const projectId = req.params.projectId;
  const { identifier, role } = req.body; // Bl username wla email
  try {
    // Ylawej 3l user b username wla email
    const user = await User.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { username: identifier },
          { email: identifier },
        ],
      },
    });
    // Erreur
    if (!user) {
      return res.render('projects/manage-members', {
        projectId,
        members: [],
        error: 'User not found.',
      });
    }
    const existing = await ProjectMember.findOne({
      where: { userId: user.id, projectId },
    });
    if (existing) {
      return res.render('projects/manage-members', {
        projectId,
        members: [],
        error: 'User is already a member of this project.',
      });
    }
    // Yasna3 fl member
    await ProjectMember.create({
      userId: user.id,
      projectId,
      role: role === 'manager' ? 'manager' : 'member',
    });
    res.redirect(`/projects/${projectId}/members`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding member.');
  }
};
// Yna77i member mn projet
exports.removeMember = async (req, res) => {
  const { projectId, memberId } = req.params;
  try {
    await ProjectMember.destroy({
      where: {
        userId: memberId,
        projectId,
      },
    });
    res.redirect(`/projects/${projectId}/members`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error removing member.');
  }
};
// Ywarri el members bl role mte3hom
exports.showMembers = async (req, res) => {
  const projectId = req.params.id;
  try {
    const project = await Project.findByPk(projectId, {
      include: [{ 
        model: ProjectMember, 
        as: 'memberships', 
        include: [{ model: User, as: 'user' }] 
      }],
    });
    if (!project) return res.status(404).send('Project not found');
    // Elmanager wl super admin kahaw 3ndom l acces
    if (project.created_by !== req.user.id && !req.user.is_super_admin) {
      return res.status(403).send('Access denied');
    }
    const users = await User.findAll();
    // Y generaty fl view
    res.render('project-members', { user: req.user, project, users });
  } catch (error) {
    console.error('Error loading members page:', error);
    res.status(500).send('Internal server error');
  }
};
