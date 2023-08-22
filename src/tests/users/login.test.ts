import request from 'supertest';
import app from '../../server';
import mongoose from 'mongoose';
import { UserModel } from '../../models/userModel';

const user = {
  name: 'test',
  email: 'test@mail.com',
  password: '******',
};

beforeAll(async () => {
  await UserModel.deleteMany({});
  await request(app).post('/register').send(user);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoose.connection.close();
  app.close();
});

describe('Login tests', () => {

  test('should login it', async () => {

    const response = await request(app).post('/login').send({
      email: 'test@mail.com',
      password: '******',
    });
    expect(response.statusCode).toEqual(200);
    const { accessToken, name, role } = response.body;
    expect(name).toBe('test');
    expect(accessToken).not.toBeNull();
    expect(role).not.toBeNull();
    expect(response.header['set-cookie']).toBeDefined();
  });

  test('should return 401 if email not exist', async () => {
    const response = await request(app).post('/login').send({ email: 'notExist@mail.com', password: '123456' });
    expect(response.statusCode).toEqual(401);
  });

  test('should return 401 if password not match', async () => {
    const response = await request(app).post('/login').send({ email: 'test@mail.com', password: '123456' });
    expect(response.statusCode).toEqual(401);
  });
});
