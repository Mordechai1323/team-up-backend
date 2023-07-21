import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const connectDB = async () => {
  // mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(`mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.yn7n9ue.mongodb.net/team_up`);
    console.log('mongo atlas connect');
  } catch (err) {
    console.error(err);
  }
};
