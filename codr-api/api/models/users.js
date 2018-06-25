/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    session_id: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    user_level: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    display_name: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'users',
    timestamps: false
  });
};
