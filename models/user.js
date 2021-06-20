"use strict"
const { Model } = require("sequelize")
const bcrypt = require("bcrypt")
const saltRound = 10

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    async comparePassword(passwordInput) {
      return await bcrypt.compare(passwordInput, this.password)
    }
    static associate({ Contact }) {
      // define association here
      this.hasMany(Contact, { foreignKey: "userId", as: "contacts" })
    }
    toJSON() {
      return { ...this.get(), password: undefined }
    }
  }
  User.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { msg: "This email is already used for another account." },
        validate: {
          notNull: { msg: "User must have an email." },
          notEmpty: { msg: "Email  must not be empty." },
          isEmail: { msg: "Must be a valid email address." },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        // Validate password
        validate: {
          len: [6, 25],
          notNull: { msg: "User must have a password." },
          notEmpty: { msg: "Password must not be empty." },
        },
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "User must have a first name." },
          notEmpty: { msg: "First name must not be empty." },
        },
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "User must have a last name." },
          notEmpty: { msg: "Last name must not be empty." },
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
      tableName: "users",
      modelName: "User",
      hooks: {
        async beforeCreate(instance, options) {
          const hashedPassword = await bcrypt.hash(
            instance.dataValues.password,
            saltRound
          )
          instance.password = hashedPassword
        },
      },
    }
  )
  return User
}
