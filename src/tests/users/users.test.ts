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

describe('myInfo tests', () => {
  let token: string;

  beforeAll(async () => {
    await UserModel.deleteMany({});
    const response = await request(app).post('/register').send(user);
    token = response.body.accessToken;
  });

  test('should return user information if authenticated', async () => {
    const response = await request(app).get('/users/myInfo').set('authorization', `Bearer ${token}`);

    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty('name', 'test');
    expect(response.body).toHaveProperty('email', 'test@mail.com');
    expect(response.body).not.toHaveProperty('password');
    expect(response.body).not.toHaveProperty('refresh_tokens');
    expect(response.body).not.toHaveProperty('one_time_code');
  });

  test('should return 401 if token is missing', async () => {
    const response =  await request(app).get('/users/myInfo')

    expect(response.statusCode).toEqual(401);
    expect(response.body).toHaveProperty('err', 'authentication missing');
  });

  test('should return 403 if token invalid', async () => {
    const response = await request(app)
      .get('/users/myInfo')
      .set('authorization', `Bearer invalidToken`)

    expect(response.statusCode).toEqual(403);
    expect(response.body).toHaveProperty('err', 'fail validating token');
  });
});

describe('count tests', () => {
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

  test('should return the total number of users and the total number of pages', async () => {
    const response = await request(app).get('/users/count').set('authorization', `Bearer ${token}`);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('count', 3);
    expect(response.body).toHaveProperty('pages');
  });

  test("should return a different number of pages depending on the 'perPage' query parameter", async () => {
    const response = await request(app).get('/users/count').query({ perPage: 1 }).set('authorization', `Bearer ${token}`);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('count', 3);
    expect(response.body).toHaveProperty('pages', 3);

    const res2 = await request(app).get('/users/count').query({ perPage: 20 }).set('authorization', `Bearer ${token}`);

    expect(res2.statusCode).toEqual(200);
    expect(res2.body).toHaveProperty('count', 3);
    expect(res2.body).toHaveProperty('pages', 1);

    expect(res2.body.pages).toBeLessThan(response.body.pages);
  });
});


