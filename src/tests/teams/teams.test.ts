import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../server';
import { UserModel } from '../../models/userModel';
import { BoardModel } from '../../models/boardModel';
import { TeamModel } from '../../models/teamModel';

const testUser = {
  name: 'test',
  email: 'test@mail.com',
  password: '******',
};
const test1User = {
  name: 'test1',
  email: 'test1@mail.com',
  password: '******',
};
const team = {
  team_members: ['test@mail.com', 'test1@mail.com'],
  name: 'test team',
};

afterAll(async () => {
  await mongoose.disconnect();
  await mongoose.connection.close();
  app.close();
});

describe('teams tests', () => {
  describe('create team ', () => {
    let token: string;
    let user: any;
    beforeAll(async () => {
      await UserModel.deleteMany({});
      await BoardModel.deleteMany({});
      await TeamModel.deleteMany({});
      const resUer = await request(app).post('/register').send(testUser);
      const resUer1 = await request(app).post('/register').send(test1User);
      token = resUer.body.accessToken;
      const token1 = resUer1.body.accessToken;
      await request(app).post('/boards').set('authorization', `Bearer ${token}`).send({ name: 'board test' });
      await request(app).post('/boards').set('authorization', `Bearer ${token1}`).send({ name: 'board test1' });
      user = await UserModel.findOne({ email: 'test@mail.com' });
    });

    test('Should return 200 if team created', async () => {
      const response = await request(app).post('/teams').set('authorization', `Bearer ${token}`).send(team);

      expect(response.status).toEqual(201);
      expect(response.body.team.team_members.length).toEqual(2);
      expect(response.body.team.team_leader_id).toEqual(user?.id);
      expect(response.body.team.name).toEqual('test team');
      const teamLeader = await UserModel.findOne({ _id: user?._id });
      expect(teamLeader?.role).toEqual('team_leader');
    });

    test('Should return 400 if some or all of the team members were not found', async () => {
      const tempTeam = { ...team, team_members: ['test@mail.com', 'test1@mail.com', 'notFound@mail.com'] };
      const response = await request(app).post('/teams').set('authorization', `Bearer ${token}`).send(tempTeam);

      expect(response.status).toEqual(400);
      expect(response.body.usersNotFound).toEqual(['notFound@mail.com']);
    });

    test('Should return 400 if team leader not found', async () => {
      await UserModel.deleteOne({ _id: user?._id });
      const response = await request(app).post('/teams').set('authorization', `Bearer ${token}`).send(team).expect(400);
    });

    test('Should return 401 if token is missing', async () => {
      const response = await request(app).post('/teams').send(team);

      expect(response.statusCode).toEqual(401);
      expect(response.body).toHaveProperty('err', 'authentication missing');
    });

    test('Should return 403 if token invalid', async () => {
      const response = await request(app).post('/teams').set('authorization', `Bearer invalidToken`).send(team);

      expect(response.statusCode).toEqual(403);
      expect(response.body).toHaveProperty('err', 'fail validating token');
    });
  });

  describe('delete team', () => {
    let token: string;
    let user: any;
    beforeAll(async () => {
      await UserModel.deleteMany({});
      await BoardModel.deleteMany({});
      await TeamModel.deleteMany({});
      const resUer = await request(app).post('/register').send(testUser);
      const resUer1 = await request(app).post('/register').send(test1User);
      token = resUer.body.accessToken;
      const token1 = resUer1.body.accessToken;
      await request(app).post('/boards').set('authorization', `Bearer ${token}`).send({ name: 'board test' });
      await request(app).post('/boards').set('authorization', `Bearer ${token1}`).send({ name: 'board test1' });
      await request(app).post('/teams').set('authorization', `Bearer ${token}`).send(team);
      user = await UserModel.findOne({ email: 'test@mail.com' });
    });

    test('Should return 200 if team deleted', async () => {
      const response = await request(app).delete('/teams').set('authorization', `Bearer ${token}`);

      expect(response.status).toEqual(200);
      expect(response.body.team.deletedCount).toEqual(1);
    });

    test('Should return 400 if user not exist', async () => {
      await request(app).post('/teams').set('authorization', `Bearer ${token}`).send(team);
      await UserModel.deleteOne({ _id: user?._id });
      await request(app).delete('/teams').set('authorization', `Bearer ${token}`).expect(400);
    });
  });

  describe('get team test', () => {
    let token: string;
    beforeAll(async () => {
      await UserModel.deleteMany({});
      await BoardModel.deleteMany({});
      await TeamModel.deleteMany({});
      const resUer = await request(app).post('/register').send(testUser);
      const resUer1 = await request(app).post('/register').send(test1User);
      token = resUer.body.accessToken;
      const token1 = resUer1.body.accessToken;
      await request(app).post('/boards').set('authorization', `Bearer ${token}`).send({ name: 'board test' });
      await request(app).post('/boards').set('authorization', `Bearer ${token1}`).send({ name: 'board test1' });
      await request(app).post('/teams').set('authorization', `Bearer ${token}`).send(team);
    });

    test('Should return 200 and team', async () => {
      const response = await request(app).get('/teams').set('authorization', `Bearer ${token}`);

      expect(response.status).toEqual(200);
      expect(response.body.team.team_members.length).toEqual(2);
      expect(response.body.teamMembers[0].name).toEqual('test');
      expect(response.body.teamMembers[1].name).toEqual('test1');
    });

    test('Should return 400 if team not exist', async () => {
      await TeamModel.deleteMany({});
      const response = await request(app).get('/teams').set('authorization', `Bearer ${token}`);

      expect(response.status).toEqual(400);
    });
  });

  describe('add team member test', () => {
    let token: string;
    beforeEach(async () => {
      await UserModel.deleteMany({});
      await BoardModel.deleteMany({});
      await TeamModel.deleteMany({});
      const resUer = await request(app).post('/register').send(testUser);
      const resUer1 = await request(app).post('/register').send(test1User);
      const user3 = { name: 'test3', email: 'test3@mail.com', password: '******' };
      await request(app).post('/register').send(user3);
      token = resUer.body.accessToken;
      const token1 = resUer1.body.accessToken;
      await request(app).post('/boards').set('authorization', `Bearer ${token}`).send({ name: 'board test' });
      await request(app).post('/boards').set('authorization', `Bearer ${token1}`).send({ name: 'board test1' });
      await request(app).post('/teams').set('authorization', `Bearer ${token}`).send(team);
    });

    test('Should return 200 and added the user', async () => {
      const response = await request(app)
        .post('/teams/addTeamMember')
        .set('authorization', `Bearer ${token}`)
        .send({ team_member: 'test3@mail.com' });

      expect(response.status).toEqual(200);
      expect(response.body.team_members.length).toEqual(3);
    });

    test('Should return 400 if team member is missing', async () => {
      const response = await request(app).post('/teams/addTeamMember').set('authorization', `Bearer ${token}`);

      expect(response.statusCode).toEqual(400);
      expect(response.body).toEqual([
        {
          message: '"team_member" is required',
          path: ['team_member'],
          type: 'any.required',
          context: { label: 'team_member', key: 'team_member' },
        },
      ]);
    });

    test('Should return 400 if user not exist', async () => {
      await UserModel.deleteMany({});
      const response = await request(app)
        .post('/teams/addTeamMember')
        .set('authorization', `Bearer ${token}`)
        .send({ team_member: 'test3@mail.com' });

      expect(response.status).toEqual(400);
    });

    test('Should return 400 if team not exist', async () => {
      await TeamModel.deleteMany({});
      const response = await request(app)
        .post('/teams/addTeamMember')
        .set('authorization', `Bearer ${token}`)
        .send({ team_member: 'test3@mail.com' });

      expect(response.status).toEqual(400);
    });
  });
});
