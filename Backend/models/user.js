//model mta3 el user
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    //champ id
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    //el esm

    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    //el la9ab

    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    //el username

    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    //el email

    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    //el password bch ykoun mba3ed haché

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    //el role ykoun user wala admin (par defaut user)

    role: {
      type: DataTypes.ENUM('user', 'admin'),
      allowNull: false,
      defaultValue: 'user',
    },
    //el photo de profil (lien mte3ha)

    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });
//les clés étrangers
  User.associate = models => {
    //kol user ynajem ykoun 3andou barcha projeyet 
    User.belongsToMany(models.Project, {
      through: models.ProjectMember,
      foreignKey: 'userId',
      otherKey: 'projectId',
      as: 'projects',
    });
    //kol user ynajem ykoun member fi barcha projeyet 

    User.hasMany(models.ProjectMember, {
      foreignKey: 'userId',
      as: 'projectMemberships',
    });
    //kol user ynajem ye5ou barcha taskouwet 

    User.hasMany(models.Task, {
      foreignKey: 'assigned_to',
      as: 'tasks',
    });
  };

  return User;
};
