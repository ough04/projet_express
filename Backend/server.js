// El dependencies w setup mt3 lprojet
const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const checkSuperAdmin = require('./middleware/checkSuperAdmin');
const sequelize = require('./config');
const { Project, ProjectMember, User, Task } = require('./models');
const app = express();
const JWT_SECRET = 'projetexpress'; 
// El configuration mt3 el middleware
app.use(cookieParser());                           
app.use(express.json());                           
app.use(express.urlencoded({ extended: true }));  
app.use(methodOverride('_method'));                
// El setup mt3 partie views
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Importation mt3 el routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin.js');
const pagesRoutes = require('./routes/pages');
// El lien mt3 lpage
app.use('/', pagesRoutes);              
app.use('/api/auth', authRoutes);       
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);      
app.use('/api/users', userRoutes);      
app.use('/', adminRoutes);            
// Execution mt3 el projet
const PORT = process.env.PORT || 3000;
sequelize
  .sync({ alter: true }) 
  .then(() => {
    console.log('Database synced');
    app.listen(PORT, () => {
      console.log(`Server started on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to sync database:', err);
  });
