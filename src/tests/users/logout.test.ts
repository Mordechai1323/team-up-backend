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

describe('logout tests', () => {
    
  test('should logout', async () => {
    const login = await request(app).post('/login').send({
      email: 'test@mail.com',
      password: '******',
    });
    expect(login.statusCode).toEqual(200);

    const refreshToken = login.header['set-cookie'][0];
    const response = await request(app).get('/logout').set('Cookie', [refreshToken]);
    expect(response.statusCode).toEqual(200);
  });

  test('should return 401 if not send cookies', async () => {
    const response = await request(app).get('/logout');
    expect(response.statusCode).toEqual(401);
  });

  test('should return 403 if the token not valid', async () => {
    const refreshToken = ' token=eyJhbGcjpU; Max-Age=86400; Path=/; Expires=Tue, 22 Aug 2023 20:07:53 GMT; HttpOnly; Secure; SameSite=None';
    const response = await request(app).get('/logout').set('Cookie', [refreshToken]);
    expect(response.statusCode).toEqual(403);
  });

  test('should return 401 if refreshToken not exist in db', async () => {
    const login = await request(app).post('/login').send({
      email: 'test@mail.com',
      password: '******',
    });
    expect(login.statusCode).toEqual(200);

    const refreshToken = login.header['set-cookie'][0];
    let user = await UserModel.findOne({ email: 'test@mail.com' });
    if (user) {
      user.refresh_tokens = [];
      await user?.save();
    }
    const response = await request(app).get('/logout').set('Cookie', [refreshToken]);
    expect(response.statusCode).toEqual(401);
  });
});
