const { Sequelize } = require("sequelize");

module.exports = new Sequelize(
  "dfae1ns8mq9vi9",
  "tujhrbziacqqhe",
  "47aef6d908b4cb2d993a75c5ca39353a79b8210ef311ed592852f4c204cab4c5",
  {
    host: "ec2-63-32-248-14.eu-west-1.compute.amazonaws.com",
    port: process.env.PORT || "5432",
    dialect: "postgres",
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
  }
);
