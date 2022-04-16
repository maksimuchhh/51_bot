const sequelize = require("./db");
const { DataTypes } = require("sequelize");

const User = sequelize.define("user", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    unique: true,
  },
  username: { type: DataTypes.STRING },
  chatId: { type: DataTypes.BIGINT },
  pidorCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  isPidor: { type: DataTypes.BOOLEAN, defaultValue: false },
});

module.exports = User;
