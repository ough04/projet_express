const { DataTypes } = require('sequelize');
const sequelize = require('../config');
// EL definition mt3 el membre
const ProjectMember = sequelize.define('ProjectMember', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  role: {
    type: DataTypes.ENUM('manager', 'member'),
    allowNull: false,
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  joined_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'project_members',
  timestamps: false,  
  underscored: false,
});
// Relation mt3 el tableau members m3a ba9iyet al base
ProjectMember.associate = (models) => {
  ProjectMember.belongsTo(models.Project, { foreignKey: 'project_id', as: 'project' });
  ProjectMember.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  ProjectMember.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator' });
};
module.exports = ProjectMember;
