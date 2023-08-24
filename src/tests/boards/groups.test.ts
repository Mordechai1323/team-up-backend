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

describe('groups tests', () => {
  describe('add group test', () => {
    let token: string;
    let boardID: string;
    beforeAll(async () => {
      await UserModel.deleteMany({});
      await BoardModel.deleteMany({});
      const response = await request(app).post('/register').send(testUser);
      token = response.body.accessToken;
      const resBoard = await request(app).post('/boards').set('authorization', `Bearer ${token}`).send({ name: 'board test' });
      boardID = resBoard?.body._id;
    });

    test('Should create new group', async () => {
      const response = await request(app).post('/groups').set('authorization', `Bearer ${token}`).query({ boardID });

      expect(response.statusCode).toEqual(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('name', 'New Group');
      expect(response.body).toHaveProperty('board_id', boardID);
    });

    test('Should return 400 if not provided boardID', async () => {
      const response = await request(app).post('/groups').set('authorization', `Bearer ${token}`);

      expect(response.statusCode).toEqual(400);
    });

    test('Should return 401 if token is missing', async () => {
      const response = await request(app).post('/groups').query({ boardID });

      expect(response.statusCode).toEqual(401);
      expect(response.body).toHaveProperty('err', 'authentication missing');
    });

    test('Should return 403 if token invalid', async () => {
      const response = await request(app).post('/groups').set('authorization', `Bearer invalidToken`).query({ boardID });

      expect(response.statusCode).toEqual(403);
      expect(response.body).toHaveProperty('err', 'fail validating token');
    });
  });
});
