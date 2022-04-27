const { Sequelize } = require("sequelize");

module.exports = new Sequelize(
  "dcbni6chbb6dh9",
  "kphfixicsbnmjk",
  "cd54a9562bb02d00e129caf05ce2707f1c8e6201a357ba588e61e5c6d3ca92b6",
  {
    host: "ec2-63-35-156-160.eu-west-1.compute.amazonaws.com",
    port: "5432",
    dialect: "postgres",
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
  }
);
