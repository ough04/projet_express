const { ProjectMember, Project } = require('../models');
// middleware: ychouf el user kenou super admin wla member lel prj
async function checkProjectManager(req, res, next) {
  const userId = req.user.id;
  const projectId = req.params.projectId || req.body.project_id;
  if (!projectId) {
    return res.status(400).json({ message: 'Project ID is required' });
  }
  try {
    // El admin dima 3ndou acces
    if (req.user.is_super_admin) {
      return next();
    }
    // Ychouf el user manager wale
    const membership = await ProjectMember.findOne({
      where: {
        project_id: projectId,
        user_id: userId,
        role: 'manager',
      },
    });
    if (!membership) {
      return res.status(403).json({ message: 'Access denied: not project manager' });
    }
    next(); 
  } catch (error) {
    console.error('Role middleware error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
// middleware: ychouf el user manager wla member fl prj 
async function checkProjectMemberOrManager(req, res, next) {
  const userId = req.user.id;
  const projectId = req.params.projectId || req.body.project_id;
  if (!projectId) {
    return res.status(400).json({ message: 'Project ID is required' });
  }
  try {
    if (req.user.is_super_admin) {
      return next();
    }
    const membership = await ProjectMember.findOne({
      where: {
        project_id: projectId,
        user_id: userId,
        role: ['manager', 'member'],
      },
    });
    if (!membership) {
      console.log('Authenticated user:', req.user);
      console.log('Checking membership for project:', projectId);
      return res.status(403).json({ message: 'Access denied: not a project member' });
    }
    next(); 
  } catch (error) {
    console.error('Role middleware error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
module.exports = {
  checkProjectManager,
  checkProjectMemberOrManager,
};
