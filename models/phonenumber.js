"use strict"
const { Model } = require("sequelize")
module.exports = (sequelize, DataTypes) => {
  class PhoneNumber extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Contact }) {
      // define association here
      this.belongsTo(Contact, { foreignKey: "contactId", as: "contact" })
    }
  }
  PhoneNumber.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      contactId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      phoneType: {
        type: DataTypes.ENUM(["work", "home", "mobile", "other"]),
        allowNull: false,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Contact must have a phone number." },
          notEmpty: { msg: "Phone number  must not be empty." },
        },
      },
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
      tableName: "phoneNumbers",
      modelName: "PhoneNumber",
    }
  )
  return PhoneNumber
}
