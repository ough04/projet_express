const { Task, ProjectMember, Project, User } = require('../models');
exports.addTask = async (req, res) => {
  try {
    const selectedProjectId = req.query.project_id; 
    // Ye5ou el projeyet elii ma3moulin ml user lkoll (bl members zeda)
    const projects = await Project.findAll({
      where: { created_by: req.user.id },
      include: [{
        model: ProjectMember,
        as: 'memberships',
        include: [{ model: User, as: 'user' }]
      }]
    });
    let members = [];
    // Ye5ou el memberst3 lproje ell tselecta
    if (selectedProjectId) {
      const project = projects.find(p => p.id == selectedProjectId);
      if (project) {
        members = project.memberships.map(m => m.user); 
      }
    } 
    else if (projects.length > 0) {
      members = projects[0].memberships.map(m => m.user);
    }
    // Y generaty el page t3 l creation
    res.render('task-new', {
      user: req.user,
      projects,
      members,
      selectedProjectId,
    });
  } catch (error) {
    console.error('Error loading new task page:', error);
    res.status(500).send('Internal server error');
  }
};
// Ye5ou el tasks lkoll mt3 l user w yrodhom visible fi page 
exports.getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const isSuperAdmin = req.user.is_super_admin;
    let tasks;
    if (isSuperAdmin) {
      // El admin yra el tasks lkoll
      tasks = await Task.findAll({
        include: [{ model: Project, as: 'project' }],
        order: [['due_date', 'ASC']],
      });
    } else {
      // Ye5ou el tasks mt3 lprojet elli el user member fih
      const memberships = await ProjectMember.findAll({
        where: { user_id: userId },
        attributes: ['project_id'],
      });
      const projectIds = memberships.map(m => m.project_id);
      tasks = await Task.findAll({
        where: { project_id: projectIds },
        include: [{ model: Project, as: 'project' }],
        order: [['due_date', 'ASC']],
      });
    }
    // Ygeneraty el page t3 tasks
    res.render('tasks', {
      user: req.user,
      tasks,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.render('tasks', {
      user: req.user,
      tasks: [],
      error: 'Failed to load tasks',
    });
  }
};
// ye5ou el task bl id (tetbadel 7asb el role mt3 el user)
exports.getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;
    const isSuperAdmin = req.user.is_super_admin;
    const task = await Task.findByPk(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (!isSuperAdmin) {
      // Ycouf ken el user member wale
      const membership = await ProjectMember.findOne({
        where: {
          project_id: task.project_id,
          user_id: userId,
        },
      });
      if (!membership && task.assigned_to !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    // Yna77i fields mou3aynin kima el id (a5ta el admin)
    let taskData = task.toJSON();
    if (!isSuperAdmin) {
      delete taskData.id;
      delete taskData.project_id;
      delete taskData.assigned_to;
      delete taskData.created_by;
    }
    return res.json(taskData);
  } catch (error) {
    console.error('Get task by ID error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
// Ybadel fl task
exports.edit = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;
    const isSuperAdmin = req.user.is_super_admin;
    const task = await Task.findByPk(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    // Ychouf ken el user 3ndou l7a9 ubdl fl task wale
    if (!isSuperAdmin) {
      const membership = await ProjectMember.findOne({
        where: {
          project_id: task.project_id,
          user_id: userId,
          role: 'manager',
        },
      });
      if (!(membership || task.assigned_to === userId)) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    const { title, description, status, priority, due_date, assigned_to } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (due_date !== undefined) task.due_date = due_date;
    if (assigned_to !== undefined) task.assigned_to = assigned_to;
    await task.save();
    // Yraja3 eltaskel jdida
    if (req.accepts('html')) {
      return res.redirect('/tasks');
    }
    return res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
// Y generaty el form mt3 edit task
exports.updateTask = async (req, res) => {
  const taskId = req.params.id;
  try {
    const task = await Task.findByPk(taskId, {
      include: [
        { model: Project, as: 'project' },
        { model: User, as: 'assignee', foreignKey: 'assigned_to' }
      ],
    });
    if (!task) return res.status(404).send('Task not found');
    const userId = req.user.id;
    const isSuperAdmin = req.user.is_super_admin;
    // el manager w el manager elli lehi bl task yraw el page
    if (!isSuperAdmin) {
      const isCreator = task.created_by === userId;
      const isAssignee = task.assigned_to === userId;
      const membership = await ProjectMember.findOne({
        where: {
          user_id: userId,
          project_id: task.project_id,
          role: 'manager',
        },
      });
      if (!(isCreator || isAssignee || membership)) {
        return res.status(403).send('Access denied');
      }
    }
    task.due_date_formatted = task.due_date
      ? new Date(task.due_date).toISOString().slice(0, 10)
      : '';
    // El members yetraw fl dropdow 
    const projectMembers = await ProjectMember.findAll({
      where: { project_id: task.project_id },
      include: [{ model: User, as: 'user' }],
    });
    const members = projectMembers.map(pm => pm.user);
    res.render('task-edit', {
      user: req.user,
      task,
      members,
    });
  } catch (error) {
    console.error('Error loading edit task page:', error);
    res.status(500).send('Internal server error');
  }
};
// Yfasa5 task
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findByPk(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await task.destroy();
    return res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
// Yasna3 task jdida
exports.createTask = async (req, res) => {
  try {
    const { project_id, assigned_to, title, description, status, priority, due_date } = req.body;
    const userId = req.user.id;
    // EL fields elli lezem ykounou mawjoudin
    if (!project_id || !title || !due_date) {
      if (req.accepts('html')) {
        return res.status(400).send('project_id, title, and due_date are required');
      }
      return res.status(400).json({ message: 'project_id, title, and due_date are required' });
    }
    const task = await Task.create({
      project_id,
      assigned_to: assigned_to || null,
      title,
      description: description || null,
      status: status || 'todo',
      priority: priority || 'medium',
      due_date,
      created_by: userId,
    });
    if (req.accepts('html')) {
      return res.redirect('/tasks');
    }
    return res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    if (req.accepts('html')) {
      return res.status(500).send('Internal server error');
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};
