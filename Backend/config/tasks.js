const db = require('../models');
const Task = db.Task;
const ProjectMember = db.ProjectMember;
const Project = db.Project;
const User = db.User;
// Asna3 task (el manager kahaw)
exports.create = async (req, res) => {
  const { project_id, title, description, priority, due_date, assigned_to } = req.body;
  try {
    // Manager wale
    const isManager = await ProjectMember.findOne({
      where: { project_id, user_id: req.user.id, role: 'manager' }
    });
    if (!isManager) {
      return res.status(403).json({ message: "Seul un manager peut créer une tâche." });
    }
    // Membre fl prj wala le
    if (assigned_to) {
      const isAssigneeMember = await ProjectMember.findOne({
        where: { project_id, user_id: assigned_to }
      });
      if (!isAssigneeMember) {
        return res.status(400).json({ message: "L'utilisateur assigné n'est pas membre du projet." });
      }
    }
    // ASna3 task
    const task = await Task.create({
      title,
      description,
      priority,
      due_date,
      assigned_to,
      created_by: req.user.id,
      project_id
    });
    // el super admin kahaw ye5ou l id
    if (req.user.is_super_admin) return res.status(201).json(task);
    const { id, ...filtered } = task.toJSON();
    return res.status(201).json(filtered);

  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la création de la tâche.", error: err });
  }
};
// chouf el tasks t3 prj mou3ayen
exports.findByProject = async (req, res) => {
  const { projectId } = req.params;

  try {
    // member wla super admin akahaw
    const isMember = await ProjectMember.findOne({
      where: { project_id: projectId, user_id: req.user.id }
    });
    if (!isMember && !req.user.is_super_admin) {
      return res.status(403).json({ message: "Acces refuse. vous n'etes pas membre de ce projet." });
    }
    const tasks = await Task.findAll({
      where: { project_id: projectId },
      include: [
        { model: User, as: 'assignee', attributes: ['username'] },
        { model: User, as: 'creator', attributes: ['username'] }
      ]
    });
    const result = tasks.map(task => {
      const { id, created_by, assigned_to, project_id, ...rest } = task.toJSON();
      if (req.user.is_super_admin) return task;
      return rest;
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des taches.", error: err });
  }
};
// lawej 3l task
exports.findById = async (req, res) => {
  try {
    // Lawej 3l task
    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['username'] },
        { model: User, as: 'creator', attributes: ['username'] }
      ]
    });
    if (!task) return res.status(404).json({ message: "Tache introuvable." });
    // El user lezmou ybda member 
    const isMember = await ProjectMember.findOne({
      where: { project_id: task.project_id, user_id: req.user.id }
    });
    if (!isMember && !req.user.is_super_admin) {
      return res.status(403).json({ message: "Acces refuse." });
    }
    // 7asb el role  
    if (req.user.is_super_admin) return res.json(task);
    const { id, created_by, assigned_to, project_id, ...rest } = task.toJSON();
    res.json(rest);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la recuperation de la tache.", error: err });
  }
};
// Badel el status t3 el task (manager wla el user elli teb3etou el task)
exports.updateStatus = async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;
  try {
    const task = await Task.findByPk(taskId);
    if (!task) return res.status(404).json({ message: "Tache introuvable." });
    const isManager = await ProjectMember.findOne({
      where: { project_id: task.project_id, user_id: req.user.id, role: 'manager' }
    });
    const isAssignee = task.assigned_to === req.user.id;
    if (!isAssignee && !isManager && !req.user.is_super_admin) {
      return res.status(403).json({ message: "Vous n'avez pas le droit de modifier le statut." });
    }
    task.status = status;
    await task.save();
    res.json({ message: "Statut mis a jour avec succes." });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la mise a jour du statut.", error: err });
  }
};
// FASSA5
exports.delete = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: "Tache non trouvee." });
    const isManager = await ProjectMember.findOne({
      where: { project_id: task.project_id, user_id: req.user.id, role: 'manager' }
    });
    if (!isManager && !req.user.is_super_admin) {
      return res.status(403).json({ message: "Seul un manager peut supprimer une tache." });
    }
    await task.destroy();
    res.json({ message: "Tache supprimee avec succes." });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la suppression.", error: err });
  }
};
