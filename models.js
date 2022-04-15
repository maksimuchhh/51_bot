const sequelize = require("./db");
const { DataTypes } = require("sequelize");

const User = sequelize.define("user", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
  },
  username: { type: DataTypes.STRING },
  chatId: { type: DataTypes.BIGINT },
  pidorCount: { type: DataTypes.INTEGER, defaultValue: 0 },
});

module.exports = User;
