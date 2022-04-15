const sequelize = require("./db");
const { DataTypes } = require("sequelize");

const User = sequelize.define("user", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
  },
  username: { type: DataTypes.STRING },
  chatId: { type: DataTypes.INTEGER },
  pidorCount: { type: DataTypes.INTEGER, defaultValue: 0 },
});

module.exports = User;
