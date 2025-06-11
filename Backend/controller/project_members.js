const db = require('../models');
const Project = db.Project;
const ProjectMember = db.ProjectMember;
const User = db.User;
// Zid member
exports.addMember = async (req, res) => {
  const { projectId } = req.params;
  const { username, role } = req.body;
  try {
    // El user lezmou ykoun manager
    const isManager = await ProjectMember.findOne({
      where: { project_id: projectId, user_id: req.user.id, role: 'manager' }
    });
    if (!isManager && !req.user.is_super_admin) {
      return res.status(403).json({ message: "Seul un manager ou super admin peut ajouter des membres." });
    }
    // Nlawjou 3l user elli bch nzidouh (bl username)
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé avec ce nom d'utilisateur." });
    }
    // El user membre deja fl prj wale
    const existing = await ProjectMember.findOne({
      where: { project_id: projectId, user_id: user.id }
    });
    if (existing) {
      return res.status(400).json({ message: "Cet utilisateur est déjà membre du projet." });
    }
    const newMember = await ProjectMember.create({
      project_id: projectId,
      user_id: user.id,
      role: role || 'member',
      created_by: req.user.id
    });
    res.status(201).json(newMember);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de l'ajout du membre.", error: err });
  }
};
exports.updateRole = async (req, res) => {
  const { projectId, memberId } = req.params;
  const { role } = req.body;
  try {
    const manager = await ProjectMember.findOne({
      where: { project_id: projectId, user_id: req.user.id, role: 'manager' }
    });
    if (!manager && !req.user.is_super_admin) {
      return res.status(403).json({ message: "Seul un manager ou super admin peut modifier les rôles." });
    }
    const updated = await ProjectMember.update(
      { role },
      { where: { project_id: projectId, user_id: memberId } }
    );
    if (updated[0] === 0) {
      return res.status(404).json({ message: "Membre non trouvé ou rôle inchangé." });
    }

    res.json({ message: "Rôle mis à jour avec succès." });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la modification du rôle.", error: err });
  }
};
// Na77i member
exports.removeMember = async (req, res) => {
  const { projectId, memberId } = req.params;
  try {
    // El user lezmou ybda manager
    const manager = await ProjectMember.findOne({
      where: { project_id: projectId, user_id: req.user.id, role: 'manager' }
    });
    if (!manager && !req.user.is_super_admin) {
      return res.status(403).json({ message: "Seul un manager ou super admin peut retirer un membre." });
    }
    // el manager ynjmch yna77i ro7ou
    if (parseInt(memberId) === req.user.id && !req.user.is_super_admin) {
      return res.status(400).json({ message: "Vous ne pouvez pas vous retirer vous-même." });
    }
    // FASSA5
    const removed = await ProjectMember.destroy({
      where: { project_id: projectId, user_id: memberId }
    });
    if (removed === 0) {
      return res.status(404).json({ message: "Membre non trouvé dans le projet." });
    }
    res.json({ message: "Membre retiré avec succès." });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la suppression du membre.", error: err });
  }
};
// Lista t3 les membres
exports.listMembers = async (req, res) => {
  const { projectId } = req.params;

  try {
    // Membre wla admin akahaw
    const isMember = await ProjectMember.findOne({
      where: { project_id: projectId, user_id: req.user.id }
    });
    if (!isMember && !req.user.is_super_admin) {
      return res.status(403).json({ message: "Accès refusé. Vous n'êtes pas membre de ce projet." });
    }
    // recuperation mt3 lmembers
    const members = await ProjectMember.findAll({
      where: { project_id: projectId },
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }]
    });
    // el admin kahaw yra el infs lkoll
    const sanitized = members.map(m => {
      const { id, username, email } = m.user;
      return {
        role: m.role,
        joined_at: m.joined_at,
        user: req.user.is_super_admin
          ? { id, username, email }  
          : { username, email }    
      };
    });
    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des membres.", error: err });
  }
};
