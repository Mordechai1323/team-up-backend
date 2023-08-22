import request from 'supertest';
import app from '../../server';
import mongoose from 'mongoose';
import { UserModel, generateAccessToken } from '../../models/userModel';

const user = {
  name: 'test',
  email: 'test@mail.com',
  password: '******',
};

afterAll(async () => {
  await UserModel.deleteMany({});
  await mongoose.disconnect();
  await mongoose.connection.close();
  app.close();
});

describe('allUsers tests', () => {
  let token: string;
  beforeAll(async () => {
    await UserModel.deleteMany({});
    let user1 = new UserModel({
      email: 'user1@mail.com',
      password: 'password',
      role: 'user',
    });
    user1 = await user1.save();
    let user2 = new UserModel({
      email: 'user2@mail.com',
      password: 'password',
      role: 'user',
    });
    user2 = await user2.save();
    let admin = new UserModel({
      email: 'admin@mail.com',
      password: 'password',
      role: 'admin',
    });
    admin = await admin.save();
    token = generateAccessToken(admin._id, admin.role, admin.email);
  });

  test('should return a list of users if request is authorized', async () => {
    const response = await request(app).get('/users/allUsers').set('authorization', `Bearer ${token}`);
    expect(response.status).toEqual(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(3);
  });

  test('should return 401 if token is missing or invalid', async () => {
    const response = await request(app).get('/users/allUsers');

    expect(response.statusCode).toEqual(401);
    expect(response.body).toHaveProperty('err');
    expect(response.body.err).toEqual('authentication missing');
  });

  test("should return users limited by the 'perPage' query parameter", async () => {
    const response = await request(app).get('/users/allUsers').query({ perPage: 2 }).set('authorization', `Bearer ${token}`);
    expect(response.statusCode).toEqual(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
  });
});


