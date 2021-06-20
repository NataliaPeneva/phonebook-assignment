"use strict"
const { Model } = require("sequelize")
module.exports = (sequelize, DataTypes) => {
  class Contact extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, PhoneNumber }) {
      // define association here
      this.belongsTo(User, { foreignKey: "userId", as: "user" })
      this.hasMany(PhoneNumber, { foreignKey: "contactId", as: "phoneNumber" })
    }
  }
  Contact.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "User must have a first name." },
          notEmpty: { msg: "First name must not be empty." },
        },
      },
      lastName: DataTypes.STRING,

      email: {
        type: DataTypes.STRING,
        validate: {
          isEmail: { msg: "Must be a valid email address." },
        },
      },
      address: DataTypes.STRING,
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      tableName: "users",
      modelName: "Contact",
    }
  )
  return Contact
}
