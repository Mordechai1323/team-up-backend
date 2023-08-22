import request from 'supertest';
import app from '../../server';
import mongoose from 'mongoose';
import { UserModel } from '../../models/userModel';
import { BoardModel } from '../../models/boardModel';

const testUser = {
  name: 'test',
  email: 'test@mail.com',
  password: '******',
};

afterAll(async () => {
  await mongoose.disconnect();
  await mongoose.connection.close();
  app.close();
});

describe('board tests', () => {
  describe('add board test', () => {
    let token: string;
    let user: any;
    beforeAll(async () => {
      await UserModel.deleteMany({});
      await BoardModel.deleteMany({});
      const response = await request(app).post('/register').send(testUser);
      token = response.body.accessToken;
      user = await UserModel.findOne({ email: 'test@mail.com' });
    });

    test('should create new board', async () => {
      const response = await request(app).post('/boards').set('authorization', `Bearer ${token}`).send({ name: 'board test' });

      expect(response.statusCode).toEqual(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('name', 'board test');
      expect(response.body).toHaveProperty('user_id', user?.id);
      expect(response.body.share_with[0]).toHaveProperty('isOwner', true);
    });

    test('should return 400 if validation fails', async () => {
      const response = await request(app).post('/boards').set('authorization', `Bearer ${token}`);

      expect(response.statusCode).toEqual(400);
      expect(response.body).toEqual([
        {
          message: '"name" is required',
          path: ['name'],
          type: 'any.required',
          context: { label: 'name', key: 'name' },
        },
      ]);
    });

    test('should return 401 if token is missing', async () => {
      const response = await request(app).post('/boards').send({ name: 'board test' });

      expect(response.statusCode).toEqual(401);
      expect(response.body).toHaveProperty('err', 'authentication missing');
    });

    test('should return 403 if token invalid', async () => {
      const response = await request(app).post('/boards').set('authorization', `Bearer invalidToken`).send({ name: 'board test' });

      expect(response.statusCode).toEqual(403);
      expect(response.body).toHaveProperty('err', 'fail validating token');
    });

    test('should return 400 if user not exist', async () => {
      await UserModel.deleteOne({ email: 'test@mail.com' });
      const response = await request(app).post('/boards').set('authorization', `Bearer ${token}`).send({ name: 'board test' });

      expect(response.statusCode).toEqual(400);
    });
  });
});
