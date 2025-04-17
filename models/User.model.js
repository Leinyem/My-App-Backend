const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required."],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
    },
    profileImage: {
      type: String,
      default:
        "https://t3.ftcdn.net/jpg/12/81/12/16/360_F_1281121663_JexyrHrABeHc8ItCyFBMCGhjePQzLUBV.jpg",
    },

    createdBooks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Book",
      },
    ],

    borrowedBooks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Book",
      },
    ],
  },

  { timestamps: true }
);

const UserModel = model("User", userSchema);

module.exports = UserModel;
