const sequelize = require("../utils/psqlConnection.js");
const  { DataTypes } = require("sequelize");

const Track = sequelize.define("Track", {
  trackId: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  publisherName: { type: DataTypes.STRING, allowNull: false },
  trackSize: { type: DataTypes.INTEGER, allowNull: false },
  trackPath: { type: DataTypes.STRING, allowNull: false },
  fileName: { type: DataTypes.STRING, allowNull: false },
});

module.exports = Track;
