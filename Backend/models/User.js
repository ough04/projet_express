const { DataTypes } = require('sequelize');
const sequelize = require('../config'); 
// EL definition mt3 el user
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
  },
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: false,
  },
  password_hash: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  is_super_admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
}, {
  tableName: 'users',
  timestamps: true,        
  underscored: false,      
});
// Relation mt3 el tableau users m3a ba9iyet al base
User.associate = (models) => {
  User.hasMany(models.Project, { foreignKey: 'created_by', as: 'projectsCreated' });     
  User.hasMany(models.Task, { foreignKey: 'created_by', as: 'tasksCreated' });           
  User.hasMany(models.Task, { foreignKey: 'assigned_to', as: 'tasksAssigned' });          
  User.hasMany(models.ProjectMember, { foreignKey: 'user_id', as: 'projectMemberships' }); 
};
module.exports = User;
