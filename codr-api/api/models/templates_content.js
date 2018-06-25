/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('templates_content', {
    template_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'templates',
        key: 'id'
      }
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'groups',
        key: 'id'
      }
    },
    project_right: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    comment_right: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'templates_content',
    timestamps: false
  });
};
