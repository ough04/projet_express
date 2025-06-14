const jwt = require('jsonwebtoken');
const JWT_SECRET = 'projetexpress'; 
// Middleware lrl projetction mt3 el routes b jwt.verify
function authMiddleware(req, res, next) {
  let token = null;
  // Ylawej 3la el token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  if (!token) {
    return res.status(401).json({ message: 'Authorization header missing or malformed' });
  }
  try {
    // Y verify el token w y atachi el infos bl requete
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      username: decoded.username,
      is_super_admin: decoded.is_super_admin,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
module.exports = authMiddleware;
