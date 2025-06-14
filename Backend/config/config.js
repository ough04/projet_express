
const { Sequelize } = require('sequelize');


const sequelize = new Sequelize('project', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false, 
  define: {
    timestamps: true,  
  },
});

module.exports = sequelize;
