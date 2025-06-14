
function checkSuperAdmin(req, res, next) {
  if (req.user && req.user.is_super_admin) {
    next();
  } else {
    res.status(403).send('Access denied: super admin only');
  }
}
module.exports = checkSuperAdmin;
