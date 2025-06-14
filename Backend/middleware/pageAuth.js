const jwt = require('jsonwebtoken');
const JWT_SECRET = 'projetexpress'; 
// Middleware bch nverifiw el acces lel page
function verifyPageToken(req, res, next) {
  const authHeader = req.headers.authorization || req.cookies?.token;
  if (!authHeader) {
    return res.redirect('/login'); // Ken ma l9ach token y3adih lel login
  }
  // Y extracti fltoken 
  let token;
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else {
    token = authHeader;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.redirect('/login'); // Ken l9a el token invalide y3adih lel login
  }
}
module.exports = verifyPageToken;
