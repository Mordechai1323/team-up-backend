import request from 'supertest';
import app from '../../server';
import mongoose from 'mongoose';
import { UserModel } from '../../models/userModel';
import { BoardModel } from '../../models/boardModel';
import { GroupModel } from '../../models/groupModel';

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
      await GroupModel.deleteMany();
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

    test('Should return 400 if  boardID is missing', async () => {
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

  describe('delete board test', () => {
    let token: string;
    let groupID: string;
    beforeAll(async () => {
      await UserModel.deleteMany({});
      await BoardModel.deleteMany({});
      await GroupModel.deleteMany();
      const response = await request(app).post('/register').send(testUser);
      token = response.body.accessToken;
      const resBoard = await request(app).post('/boards').set('authorization', `Bearer ${token}`).send({ name: 'board test' });
      const boardID = resBoard.body._id;
      const resAddGroup = await request(app).post('/groups').set('authorization', `Bearer ${token}`).query({ boardID });
      groupID = resAddGroup?.body._id;
    });

    test('Should return 200 if board delete successfully', async () => {
      const response = await request(app).delete(`/groups`).set('authorization', `Bearer ${token}`).query({ groupID });

      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty('deletedCount', 1);
    });

    test('Should return 400 if groupID is missing', async () => {
      const response = await request(app).delete(`/groups`).set('authorization', `Bearer ${token}`);

      expect(response.statusCode).toEqual(400);
    });

    test('Should return 401 if token is missing', async () => {
      const response = await request(app).delete(`/groups`).query({ groupID });

      expect(response.statusCode).toEqual(401);
      expect(response.body).toHaveProperty('err', 'authentication missing');
    });

    test('Should return 403 if token invalid', async () => {
      const response = await request(app).delete(`/groups`).set('authorization', `Bearer invalidToken`).query({ groupID });

      expect(response.statusCode).toEqual(403);
      expect(response.body).toHaveProperty('err', 'fail validating token');
    });
  });

  describe('get my groups test', () => {
    let token: string;
    let boardID: string;
    beforeAll(async () => {
      await UserModel.deleteMany({});
      await BoardModel.deleteMany({});
      await GroupModel.deleteMany();
      const response = await request(app).post('/register').send(testUser);
      token = response.body.accessToken;
      const resBoard = await request(app).post('/boards').set('authorization', `Bearer ${token}`).send({ name: 'board test' });
      boardID = resBoard.body._id;
      await request(app).post('/groups').set('authorization', `Bearer ${token}`).query({ boardID });
    });

    test('Should return array of groups', async () => {
      const response = await request(app).get(`/groups`).set('authorization', `Bearer ${token}`).query({ boardID });

      expect(response.status).toEqual(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    test('Should return only one group', async () => {
      const response = await request(app).get(`/groups`).set('authorization', `Bearer ${token}`).query({ boardID, s: 'New Group' });

      expect(response.status).toEqual(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
    });

    test('Should return 400 if boardID is missing', async () => {
      const response = await request(app).get(`/groups`).set('authorization', `Bearer ${token}`);

      expect(response.statusCode).toEqual(400);
    });

    test('Should return 401 if token is missing', async () => {
      const response = await request(app).get(`/groups`).query({ boardID });

      expect(response.statusCode).toEqual(401);
      expect(response.body).toHaveProperty('err', 'authentication missing');
    });

    test('Should return 403 if token invalid', async () => {
      const response = await request(app).get(`/groups`).set('authorization', `Bearer invalidToken`).query({ boardID });

      expect(response.statusCode).toEqual(403);
      expect(response.body).toHaveProperty('err', 'fail validating token');
    });
  });

  describe('edit group test', () => {
    let token: string;
    let groupID: string;
    beforeAll(async () => {
      await UserModel.deleteMany({});
      await BoardModel.deleteMany({});
      await GroupModel.deleteMany();
      const response = await request(app).post('/register').send(testUser);
      token = response.body.accessToken;
      const resBoard = await request(app).post('/boards').set('authorization', `Bearer ${token}`).send({ name: 'board test' });
      const boardID = resBoard.body._id;
      const resAddGroup = await request(app).post('/groups').set('authorization', `Bearer ${token}`).query({ boardID });
      groupID = resAddGroup?.body._id;
    });

    test('Should return 200 if board is changed successfully', async () => {
      const response = await request(app)
        .put(`/groups`)
        .set('authorization', `Bearer ${token}`)
        .query({ groupID })
        .send({ name: 'edited group name' });

      expect(response.statusCode).toEqual(200);
      expect(response.body.modifiedCount).toBe(1);
    });

    test('Should return 400 if name is missing', async () => {
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

    test('Should return 400 if groupID is missing', async () => {
      const response = await request(app).put(`/groups`).set('authorization', `Bearer ${token}`);

      expect(response.statusCode).toEqual(400);
    });

    test('Should return 401 if token is missing', async () => {
      const response = await request(app).put(`/groups`).query({ groupID });

      expect(response.statusCode).toEqual(401);
      expect(response.body).toHaveProperty('err', 'authentication missing');
    });

    test('Should return 403 if token invalid', async () => {
      const response = await request(app).put(`/groups`).set('authorization', `Bearer invalidToken`).query({ groupID });

      expect(response.statusCode).toEqual(403);
      expect(response.body).toHaveProperty('err', 'fail validating token');
    });
  });
});
