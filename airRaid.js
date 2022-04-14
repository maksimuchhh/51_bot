const sequelize = require("./db");
const { DataTypes } = require("sequelize");

const AirRaid = sequelize.define("airRaid", {
  isAirRaidActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = AirRaid;
