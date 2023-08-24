import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../server';
import { UserModel } from '../../models/userModel';
import { BoardModel } from '../../models/boardModel';

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

afterAll(async () => {
  await mongoose.disconnect();
  await mongoose.connection.close();
  app.close();
});

describe('teams tests', () => {
  describe('create team ', () => {
    let token: string;
    let user: any;
    const team = {
      team_members: ['test@mail.com', 'test1@mail.com'],
      name: 'test team',
    };
    beforeAll(async () => {
      await UserModel.deleteMany({});
      await BoardModel.deleteMany({});
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
      team.team_members.push('notFound@mail.com');
      const response = await request(app).post('/teams').set('authorization', `Bearer ${token}`).send(team);

      expect(response.status).toEqual(400);
      expect(response.body.usersNotFound).toEqual(['notFound@mail.com']);
    });

    test('Should return 400 if team leader not found', async () => {
      await UserModel.deleteOne({ _id: user?._id });
      const response = await request(app).post('/teams').set('authorization', `Bearer ${token}`).send(team).expect(400);
    });
  });
});
