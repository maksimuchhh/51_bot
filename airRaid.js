const sequelize = require("./db");
const { DataTypes } = require("sequelize");

const AirRaid = sequelize.define("airRaid", {
  id: { primaryKey: true, type: DataTypes.INTEGER, defaultValue: 1 },
  isAirRaidActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = AirRaid;
