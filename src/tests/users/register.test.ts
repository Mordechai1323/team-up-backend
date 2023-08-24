import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../server';
import { UserModel } from '../../models/userModel';

const user = {
  name: 'test',
  email: 'test@mail.com',
  password: '******',
};

beforeAll(async () => {
  await UserModel.deleteMany({});
});

afterEach(async () => {
  await UserModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  mongoose.connection.close();
  app.close();
});

describe('Register tests', () => {
  test('should create a new user', async () => {
    const response = await request(app).post('/register').send(user);
    expect(response.statusCode).toEqual(201);
    expect(response.body.accessToken).not.toBeNull();
    expect(response.body.user).toHaveProperty('_id');
    expect(response.body.user).toHaveProperty('name', 'test');
    expect(response.body.user).toHaveProperty('email', 'test@mail.com');
    expect(response.body.user).toHaveProperty('password', '*****');
    expect(response.header['set-cookie']).toBeDefined();
  });

  test('should return 400 if validation fails', async () => {
    const response = await request(app).post('/register').send({
      name: 'test',
    });
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual([
      {
        message: '"email" is required',
        path: ['email'],
        type: 'any.required',
        context: {
          label: 'email',
          key: 'email',
        },
      },
    ]);
  });

  test('should return 401 if email already exists', async () => {
    await UserModel.create({
      name: 'test',
      email: 'test@mail.com',
      password: '******',
    });

    const response = await request(app).post('/register').send({
      name: 'test',
      email: 'test@mail.com',
      password: '******',
    });

    expect(response.statusCode).toEqual(401);
    expect(response.body).toEqual({
      err: 'Email already in system, try log in',
      code: 11000,
    });
  });
});
