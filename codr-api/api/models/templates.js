/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('templates', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'templates',
    timestamps: false
  });
};
