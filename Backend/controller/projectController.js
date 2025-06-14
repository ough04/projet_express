const { Project, ProjectMember, User, Task } = require('../models');
// Ywarri les prjts elli el user member fihom
exports.projects= async (req, res) => {
  try {
    // Ye5ou fl projeyet elli l user sna3hom
    const projectsCreated = await Project.findAll({
      where: { created_by: req.user.id },
    });
    // Ye5ou fl projiyet elli l user member fihom
    const memberProjects = await Project.findAll({
      include: [{
        model: ProjectMember,
        as: 'memberships',
        where: { user_id: req.user.id },
      }],
    });
    const projectsMap = new Map();
    projectsCreated.forEach(project => {
      project.dataValues.isManager = true;
      projectsMap.set(project.id, project);
    });
    memberProjects.forEach(project => {
      if (!projectsMap.has(project.id)) {
        project.dataValues.isManager = false;
        projectsMap.set(project.id, project);
      }
    });
    const projects = Array.from(projectsMap.values());
    // Y generaty fl page mt3 lprojets
    res.render('projects', {
      user: req.user,
      projects,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.render('projects', {
      user: req.user,
      projects: [],
      error: 'Failed to load projects',
    });
  }
};
// Y loady el dashboard
exports.dash = async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: { created_by: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.render('dashboard', {
      user: req.user,
      projects,
      tasks: [],
    });
  } catch (error) {
    console.error('Error loading dashboard:', error);
    res.render('dashboard', {
      user: req.user,
      projects: [],
      tasks: [],
      error: 'Failed to load data',
    });
  }
};
// Yasna3 projet jdid
exports.createProject = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const userId = req.user.id;
    // Yvalidi el fields 
    if (!title) {
      if (req.accepts('html')) {
        return res.status(400).render('project-new', { 
          user: req.user, 
          error: 'Title is required',
          title, description, status
        });
      }
      return res.status(400).json({ message: 'Title is required' });
    }
    // Yasn3 fl projet
    const project = await Project.create({
      title,
      description,
      status: status || 'pending',
      created_by: userId,
    });
    // Y7ot fl user ka manager par defaut
    await ProjectMember.create({
      project_id: project.id,
      user_id: userId,
      role: 'manager',
      created_by: userId,
    });
    // El resultat
    if (req.accepts('html')) {
      return res.redirect('/projects');
    } else {
      return res.status(201).json(project);
    }
  } catch (error) {
    console.error('Create project error:', error);
    if (req.accepts('html')) {
      return res.status(500).render('project-new', { user: req.user, error: 'Internal server error' });
    } else {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
};
// Ywarri el details t3 projet (lel member w manager kahaw)
exports.showprojectsbyid = async (req,res) => {
  const projectId = req.params.id;
  try {
    const project = await Project.findByPk(projectId, {
      include: [
        {
          model: ProjectMember,
          as: 'memberships',
          include: [{ model: User, as: 'user' }],
        },
      ],
    });
    if (!project) return res.status(404).send('Project not found');
    const isCreator = project.created_by === req.user.id;
    const isMember = project.memberships.some(m => m.user_id === req.user.id);
    if (!isCreator && !isMember && !req.user.is_super_admin) {
      return res.status(403).send('Access denied');
    }
    res.render('project-detail', { user: req.user, project });
  } catch (error) {
    console.error('Error fetching project details:', error);
    res.status(500).send('Internal server error');
  }
}
// Ygeneraty el page t3 l edit t3 lprojet
exports.editproject = async(req,res) => {
  const projectId = req.params.id;
  try {
    const project = await Project.findByPk(projectId);
    if (!project) return res.status(404).send('Project not found');
    if (project.created_by !== req.user.id && !req.user.is_super_admin) {
      return res.status(403).send('Access denied');
    }
    res.render('project-edit', { user: req.user, project });
  } catch (error) {
    console.error('Error loading edit project page:', error);
    res.status(500).send('Internal server error');
  }
}
// Ybadel fl info t3 lprojet(title,description,status)
exports.updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, status } = req.body;
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (status !== undefined) project.status = status;
    await project.save();
    if (req.accepts('html')) {
      return res.redirect(`/projects/${projectId}`);
    }
    return res.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
// Yzi member l project mou3ayen
exports.addMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { user_id, role } = req.body;
    const creatorId = req.user.id;
    if (!user_id || !role) {
      if (req.accepts('html')) {
        return res.status(400).send('User and role are required');
      }
      return res.status(400).json({ message: 'user_id and role are required' });
    }
    // Ychouf el user member deja wala le
    const existing = await ProjectMember.findOne({
      where: { project_id: projectId, user_id },
    });
    if (existing) {
      if (req.accepts('html')) {
        return res.status(409).send('User already a member of this project');
      }
      return res.status(409).json({ message: 'User already a member of this project' });
    }
    // Yzid el member el jdid
    const membership = await ProjectMember.create({
      project_id: projectId,
      user_id,
      role,
      created_by: creatorId,
      joined_at: new Date(),
    });
    if (req.accepts('html')) {
      return res.redirect(`/projects/${projectId}`);
    }
    return res.status(201).json(membership);
  } catch (error) {
    console.error('Add member error:', error);
    if (req.accepts('html')) {
      return res.status(500).send('Internal server error');
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};
// Yfasa5 prj bl id mte3ou
exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findByPk(projectId);
    if (!project) {
      if (req.accepts('html')) return res.status(404).send('Project not found');
      return res.status(404).json({ message: 'Project not found' });
    }
    await project.destroy();
    if (req.accepts('html')) {
      return res.redirect('/projects'); 
    }
    return res.json({ message: 'Project deleted' });
  } catch (error) {
    console.error('Delete project error:', error);
    if (req.accepts('html')) {
      return res.status(500).send('Internal server error');
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};
