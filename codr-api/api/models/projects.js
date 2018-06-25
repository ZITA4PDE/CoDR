/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('projects', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    exercise_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'exercises',
        key: 'id'
      }
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    projectgroup_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'projectgroup',
        key: 'id'
      }
    },
    path: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'projects',
    timestamps: false
  });
};
