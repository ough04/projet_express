const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { Op } = require('sequelize'); 
const JWT_SECRET = 'projetexpress'; 
// El sign up mt3 user jdid
exports.register = async (req, res) => {
  try {
    const { username, first_name, last_name, email, password } = req.body;
    // Y valled fl fields el lezmin
    if (!username || !first_name || !last_name || !email || !password) {
      if (req.accepts('html')) {
        return res.status(400).render('register', { error: 'All fields are required' });
      } else {
        return res.status(400).json({ message: 'All fields are required' });
      }
    }
    // Ycouf ken el username wla el email mesta3mlin deja
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    });
    if (existingUser) {
      if (req.accepts('html')) {
        return res.status(409).render('register', { error: 'Username or email already in use' });
      } else {
        return res.status(409).json({ message: 'Username or email already in use' });
      }
    }
    // Ya3ml hash lel mot de pass bl bcrypt
    const password_hash = await bcrypt.hash(password, 10);
    // Yasna3 fl user fl db
    const user = await User.create({
      username,
      first_name,
      last_name,
      email,
      password_hash,
    });
    // El resultat
    if (req.accepts('html')) {
      return res.redirect('/login');
    } else {
      return res.status(201).json({ message: 'User registered successfully', userId: user.id });
    }
  } catch (error) {
    console.error('Register error:', error);
    if (req.accepts('html')) {
      return res.status(500).render('register', { error: 'Internal server error' });
    } else {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
};
// Log in b compte mawjoud fl base
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    // Yvalled fl inputs
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    // Ylawej 3l user bl username
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    // Ycomparri fl password mt3 l input belli mawjoud fl base
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    // Ygeneraty fi token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        is_super_admin: user.is_super_admin,
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    // Ystorii fl token fost cookie 
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,              
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
    });
    // Koll user tet7alou page (7asb el role mt3 el user)
    if (user.is_super_admin) {
      return res.redirect('/admin');
    } else {
      return res.redirect('/dashboard');
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
