const mongoose = require('mongoose');
require('dotenv').config();


const connectDB = async () => {
  // mongoose.set('strictQuery', true);
  // await mongoose.connect(`mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.yn7n9ue.mongodb.net/team_up`);
  // console.log('mongo atlas connect');

  try {
    await mongoose.connect(`mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.yn7n9ue.mongodb.net/team_up`);
    console.log('mongo atlas connect');
  } catch (err) {
    console.error(err);
  }
};

module.exports = connectDB;
