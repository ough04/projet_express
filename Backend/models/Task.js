const { DataTypes } = require('sequelize');
const sequelize = require('../config');
// EL definition mt3 el tasks
const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  assigned_to: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
    type: DataTypes.ENUM('todo', 'in_progress', 'done', 'blocked'),
    allowNull: false,
    defaultValue: 'todo',
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false,
    defaultValue: 'medium',
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
}, {
  tableName: 'tasks',
  timestamps: true,
  underscored: false,
});
// Relation mt3 el tableau tasks m3a ba9iyet al base
Task.associate = (models) => {
  Task.belongsTo(models.Project, { foreignKey: 'project_id', as: 'project' });
  Task.belongsTo(models.User, { foreignKey: 'assigned_to', as: 'assignee' });
  Task.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator' });
};
module.exports = Task;
