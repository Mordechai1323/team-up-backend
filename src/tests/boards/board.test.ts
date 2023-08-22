import request from 'supertest';
import app from '../../server';
import mongoose from 'mongoose';
import { UserModel } from '../../models/userModel';
import { BoardModel } from '../../models/boardModel';
import { TeamModel } from '../../models/teamModel';

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

  describe('delete board test', () => {
    let token: string;
    let boardID: string;
    let user: any;
    beforeAll(async () => {
      await UserModel.deleteMany({});
      await BoardModel.deleteMany({});
      const response = await request(app).post('/register').send(testUser);
      token = response.body.accessToken;
      const resBoard = await request(app).post('/boards').set('authorization', `Bearer ${token}`).send({ name: 'board test' });
      boardID = resBoard?.body._id;
      user = await UserModel.findOne({ email: 'test@mail.com' });
    });

    test('should delete board', async () => {
      const response = await request(app).delete(`/boards/${boardID}`).set('authorization', `Bearer ${token}`);

      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty('deletedCount', 1);
    });

    test('should return 400 if validation fails', async () => {
      const response = await request(app).delete(`/boards/${boardID}`).set('authorization', `Bearer ${token}`);

      expect(response.statusCode).toEqual(400);
    });

    test('should return 401 if token is missing', async () => {
      const response = await request(app).delete(`/boards/${boardID}`);

      expect(response.statusCode).toEqual(401);
      expect(response.body).toHaveProperty('err', 'authentication missing');
    });

    test('should return 403 if token invalid', async () => {
      const response = await request(app).delete(`/boards/${boardID}`).set('authorization', `Bearer invalidToken`);

      expect(response.statusCode).toEqual(403);
      expect(response.body).toHaveProperty('err', 'fail validating token');
    });

    test('should return 400 if board not exist', async () => {
      await BoardModel.deleteOne({ _id: boardID });
      const response = await request(app).delete(`/boards/${boardID}`).set('authorization', `Bearer ${token}`);

      expect(response.statusCode).toEqual(400);
    });
  });

  describe('get my boards test', () => {
    let token: string;
    let boardID: string;
    let user: any;
    beforeAll(async () => {
      await UserModel.deleteMany({});
      await BoardModel.deleteMany({});
      const response = await request(app).post('/register').send(testUser);
      token = response.body.accessToken;
      const resBoard = await request(app).post('/boards').set('authorization', `Bearer ${token}`).send({ name: 'board test' });
      await request(app).post('/boards').set('authorization', `Bearer ${token}`).send({ name: 'board test 2' });
      boardID = resBoard?.body._id;
      user = await UserModel.findOne({ email: 'test@mail.com' });
    });

    test('should return array of boards', async () => {
      const response = await request(app).get(`/boards/getMyBoards`).set('authorization', `Bearer ${token}`);

      expect(response.status).toEqual(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    test('should return only board test 2', async () => {
      const response = await request(app).get(`/boards/getMyBoards`).set('authorization', `Bearer ${token}`).query({ s: 'board test 2' });

      expect(response.status).toEqual(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
    });

    test('should return 401 if token is missing', async () => {
      const response = await request(app).get(`/boards/getMyBoards`);

      expect(response.statusCode).toEqual(401);
      expect(response.body).toHaveProperty('err', 'authentication missing');
    });

    test('should return 403 if token invalid', async () => {
      const response = await request(app).get(`/boards/getMyBoards`).set('authorization', `Bearer invalidToken`);

      expect(response.statusCode).toEqual(403);
      expect(response.body).toHaveProperty('err', 'fail validating token');
    });
  });

  describe('get all team boards test', () => {
    let tokenTeamLeader: string;
    beforeAll(async () => {
      await UserModel.deleteMany({});
      await BoardModel.deleteMany({});
      const team_leader = {
        name: 'team leader',
        email: 'teamLeader@mail.com',
        password: '******',
      };
      const team = { team_members: ['test@mail.com', 'teamLeader@mail.com'], name: 'test' };

      const resUser = await request(app).post('/register').send(testUser);
      const tokenUser = resUser.body.accessToken;
      const resTeamLeader = await request(app).post('/register').send(team_leader);
      tokenTeamLeader = resTeamLeader.body.accessToken;
      const resBoard = await request(app).post('/boards').set('authorization', `Bearer ${tokenUser}`).send({ name: 'board user' });
      await request(app).post('/boards').set('authorization', `Bearer ${tokenTeamLeader}`).send({ name: 'board team leader' });
      const response = await request(app).post('/teams').set('authorization', `Bearer ${tokenTeamLeader}`).send(team);
      tokenTeamLeader = response.body.accessToken;
    });

    test('should return array of team members with our boards', async () => {
      const response = await request(app).get('/boards/getAllTeamBoards').set('authorization', `Bearer ${tokenTeamLeader}`);

      expect(response.statusCode).toEqual(200);
      expect(response.body[0]).toHaveProperty('name', 'test');
      expect(response.body[0].boards.length).toEqual(1);
      expect(response.body[1]).toHaveProperty('name', 'team leader');
      expect(response.body[1].boards.length).toEqual(1);
    });

    test('should return only one board of team leader', async () => {
      const response = await request(app)
        .get('/boards/getAllTeamBoards')
        .set('authorization', `Bearer ${tokenTeamLeader}`)
        .query({ s: 'board team leader' });

        expect(response.statusCode).toEqual(200);
        expect(response.body[0]).toHaveProperty('name', 'test');
        expect(response.body[0].boards.length).toEqual(0);
        expect(response.body[1]).toHaveProperty('name', 'team leader');
        expect(response.body[1].boards.length).toEqual(1);
    });

    test('should return 401 if token is missing', async () => {
      const response = await request(app).get(`/boards/getAllTeamBoards`);

      expect(response.statusCode).toEqual(401);
      expect(response.body).toHaveProperty('err', 'authentication missing');
    });

    test('should return 403 if token invalid', async () => {
      const response = await request(app).get(`/boards/getAllTeamBoards`).set('authorization', `Bearer invalidToken`);

      expect(response.statusCode).toEqual(403);
      expect(response.body).toHaveProperty('err', 'fail validating token');
    });

    test('should return 400 if team not exist', async () => {
      const teamLeader = await UserModel.findOne({ email: 'teamLeader@mail.com' });
      await TeamModel.deleteOne({ team_leader_id: teamLeader?._id });
      const response = await request(app).get('/boards/getAllTeamBoards').set('authorization', `Bearer ${tokenTeamLeader}`);

      expect(response.statusCode).toEqual(400);
    });
  });
});