'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tb_project extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tb_project.init({
    title: DataTypes.STRING,
    content: DataTypes.STRING,
    image: DataTypes.STRING,
    user_id:DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'tb_project',
  });
  return tb_project;
};