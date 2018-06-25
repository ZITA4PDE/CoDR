/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('modules', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'modules',
    timestamps: false
  });
};
