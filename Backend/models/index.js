// Y improti fl l models
const User = require('./User');
const Project = require('./Project');
const ProjectMember = require('./ProjectMember');
const Task = require('./Task');
// Ylem el models lkoll fi objet we7ed
const models = { User, Project, ProjectMember, Task };
// Y3ml setup lel associations elli mawjoudin
Object.values(models).forEach(model => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});
module.exports = models;
