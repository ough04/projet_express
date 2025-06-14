const { DataTypes } = require('sequelize');
const sequelize = require('../config');
// EL definition mt3 el projects
const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'archived', 'completed', 'pending'),
    allowNull: false,
    defaultValue: 'pending',
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'projects',
  timestamps: true,
  underscored: false,
});
// Relation mt3 el tableau projects m3a ba9iyet al base
Project.associate = (models) => {
  Project.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator' });
  Project.hasMany(models.Task, { foreignKey: 'project_id', as: 'tasks' });
  Project.hasMany(models.ProjectMember, { foreignKey: 'project_id', as: 'memberships' });
};
module.exports = Project;
