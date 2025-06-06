const db = require('../models');
const Project = db.Project;
const ProjectMember = db.ProjectMember;
const User = db.User;
// Asna3 prj
exports.create = async (req, res) => {
  try {
    const { title, description } = req.body;
    const project = await Project.create({
      title,
      description,
      created_by: req.user.id
    });
    // El user elli 3mal el prj ywlli howa lmanager
    await ProjectMember.create({
      project_id: project.id,
      user_id: req.user.id,
      role: 'manager',
      created_by: req.user.id
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la création du projet", error: err });
  }
};
// chouf el prjiyet lkoll
exports.findAll = async (req, res) => {
  try {
    let projects;
    if (req.user.is_super_admin) {
      // el super admin akahaw 3ndou l7a9 yra el info t3 lprojiyet lkoll
      projects = await Project.findAll({
        include: [{ model: User, as: 'owner', attributes: ['id', 'username'] }]
      });
    } else {
      // el prjiyet elli el user member fihom
      const memberships = await ProjectMember.findAll({
        where: { user_id: req.user.id },
        attributes: ['project_id']
      });
      const memberProjectIds = memberships.map(pm => pm.project_id);
      // Recuperi el projet wl owner
      const allProjects = await Project.findAll({
        include: [{ model: User, as: 'owner', attributes: ['username'] }]
      });
      // el infos yodhrou 7asb el role
      projects = allProjects.map(p => {
        if (memberProjectIds.includes(p.id) || p.created_by === req.user.id) {
          // kenou member wla manager , n5abbiw el id kahaw
          const { id, ...projectWithoutId } = p.toJSON();
          return projectWithoutId;
        } else {
          // kenou user 3adi , nhotou kn el infos hedhom
          return {
            title: p.title,
            description: p.description,
            status: p.status
          };
        }
      });
    }
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des projets", error: err });
  }
};

// lawej 3la prj bl id
exports.findById = async (req, res) => {
  const id = parseInt(req.params.projectId);
  try {
    const project = await Project.findByPk(id, {
      include: [{ model: User, as: 'owner', attributes: ['id', 'username'] }]
    });
    if (!project) return res.status(404).json({ message: "Projet introuvable." });
    const isOwner = project.created_by === req.user.id;
    // el user lezem ykoun member
    const isMember = await ProjectMember.findOne({
      where: { project_id: id, user_id: req.user.id }
    });
    // admin -> acces lkoll chay
    if (req.user.is_super_admin) {
      return res.json(project);

    // manager wla membre -> acces ama mch lkoll chay
    } else if (isOwner || isMember) {
      const { id, created_by, ...projectWithoutId } = project.toJSON();
      return res.json(projectWithoutId);

    // sinon -> Saboura ka7la
    } else {
      return res.json({
        title: project.title,
        description: project.description,
        status: project.status
      });
    }
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de l'accès au projet", error: err });
  }
};

// Badel fl prj (el manager kahaw)
exports.update = async (req, res) => {
  const id = parseInt(req.params.projectId);
  try {
    const project = await Project.findByPk(id);
    if (!project) return res.status(404).json({ message: "Projet introuvable." });
    if (project.created_by !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé. Vous n'êtes pas le créateur." });
    }
    await Project.update({
      title: req.body.title,
      description: req.body.description,
      status: req.body.status
    }, {
      where: { id }
    });
    res.json({ message: "Projet mis à jour avec succès." });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la modification du projet", error: err });
  }
};
// FASSA5 (kif kif , el manager kahaw)
exports.delete = async (req, res) => {
  const id = parseInt(req.params.projectId);
  try {
    const project = await Project.findByPk(id);
    if (!project) return res.status(404).json({ message: "Projet introuvable." });
    if (project.created_by !== req.user.id) {
      return res.status(403).json({ message: "Suppression interdite. Vous n'êtes pas le créateur." });
    }
    await Project.destroy({ where: { id } });
    res.json({ message: "Projet supprimé avec succès." });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la suppression du projet", error: err });
  }
};
