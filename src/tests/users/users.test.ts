import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../server';
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

describe('edit user', () => {
  let token: string;

  beforeAll(async () => {
    await UserModel.deleteMany({});
    let user = new UserModel({
      name: 'test',
      email: 'test@mail.com',
      password: 'test',
      role: 'user',
    });
    await user.save();
    token = generateAccessToken(user._id, user.role, user.email);
  });

  test('Should return 400 when the data is not valid', async () => {
    const res = await request(app).put('/users').set('authorization', `Bearer ${token}`).send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual([
      {
        message: '"name" is required',
        path: ['name'],
        type: 'any.required',
        context: {
          label: 'name',
          key: 'name',
        },
      },
    ]);
  });

  test('should return 401 if token is missing', async () => {
    const response = await request(app).put('/users/').send({ name: 'updated', email: 'updated@mail.com' });

    expect(response.statusCode).toEqual(401);
    expect(response.body).toHaveProperty('err', 'authentication missing');
  });

  test('should return 403 if token invalid', async () => {
    const response = await request(app)
      .put('/users')
      .set('authorization', `Bearer invalidToken`)
      .send({ name: 'updated', email: 'updated@mail.com' });

    expect(response.statusCode).toEqual(403);
    expect(response.body).toHaveProperty('err', 'fail validating token');
  });

  test('Should return the updated user', async () => {
    const res = await request(app)
      .put('/users')
      .set('authorization', `Bearer ${token}`)
      .send({ name: 'updated', email: 'updated@mail.com' });

    expect(res.statusCode).toBe(200);
    expect(res.body.modifiedCount).toBe(1);
  });
});

describe('editPassword', () => {
  let token: string;
  beforeAll(async () => {
    await UserModel.deleteMany({});
    const response = await request(app).post('/register').send(user);
    token = response.body.accessToken;
  });

  test('should return 401 if token is missing', async () => {
    const response = await request(app).put('/users/editPassword').send({ password: 'password', oldPassword: 'pass' });

    expect(response.statusCode).toEqual(401);
    expect(response.body).toHaveProperty('err', 'authentication missing');
  });

  test('should return 403 if token invalid', async () => {
    const response = await request(app)
      .put('/users/editPassword')
      .set('authorization', `Bearer invalidToken`)
      .send({ password: 'password', oldPassword: 'pass' });

    expect(response.statusCode).toEqual(403);
    expect(response.body).toHaveProperty('err', 'fail validating token');
  });

  test('Should return 401 if old password does not match', async () => {
    const res = await request(app)
      .put('/users/editPassword')
      .set('authorization', `Bearer ${token}`)
      .send({ password: 'newPassword', oldPassword: 'incorrectPassword' });
    expect(res.statusCode).toEqual(401);
  });

  test('Should return 200 if password is changed successfully', async () => {
    const res = await request(app)
      .put('/users/editPassword')
      .set('authorization', `Bearer ${token}`)
      .send({ password: 'newPassword', oldPassword: '******' });
    expect(res.statusCode).toBe(200);
    expect(res.body.modifiedCount).toBe(1);
  });
});

describe('Delete user tests', () => {
  let token: string;
  beforeEach(async () => {
    await UserModel.deleteMany({});
    const response = await request(app).post('/register').send(user);
    token = response.body.accessToken;
  });

  test('should return 401 if no token provided', async () => {
    const res = await request(app).delete('/users');

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('err', 'authentication missing');
  });

  test('should return 401 if token is invalid or expired', async () => {
    const res = await request(app).delete('/users').set('authorization', `Bearer invalidToken`);

    expect(res.statusCode).toEqual(403);
    expect(res.body.err).toEqual('fail validating token');
  });

  test('should delete a user', async () => {
    const res = await request(app).delete('/users').set('authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('deletedCount', 1);
  });
});

describe('change role', () => {
  let token: string;
  beforeAll(async () => {
    await UserModel.deleteMany({});
    let user = new UserModel({
      email: 'user@mail.com',
      password: 'password',
      role: 'user',
    });
    user = await user.save();
    let admin = new UserModel({
      email: 'admin@mail.com',
      password: 'password',
      role: 'admin',
    });
    admin = await admin.save();
    token = generateAccessToken(admin._id, admin.role, admin.email);
  });

  test('Should return 400 if user_id or role is not provided', async () => {
    const resWithoutQuery = await request(app).patch('/users/changeRole').set('authorization', `Bearer ${token}`);
    expect(resWithoutQuery.status).toBe(400);
    expect(resWithoutQuery.body.err).toBe('user_id and role are required parameters');

    const user = await UserModel.findOne({ email: 'admin@mail.com' });
    const resWithUserID = await request(app)
      .patch('/users/changeRole')
      .query({ user_id: user?.id })
      .set('authorization', `Bearer ${token}`);
    expect(resWithUserID.status).toBe(400);
    expect(resWithUserID.body.err).toBe('user_id and role are required parameters');

    const resWithUserRole = await request(app).patch('/users/changeRole').query({ role: 'admin' }).set('authorization', `Bearer ${token}`);
    expect(resWithUserRole.status).toBe(400);
    expect(resWithUserRole.body.err).toBe('user_id and role are required parameters');
  });

  test('Should return 401 if you try to change yourself', async () => {
    let admin = await UserModel.findOne({ email: 'admin@mail.com' });
    let res = await request(app)
      .patch('/users/changeRole')
      .set('authorization', token)
      .query({ user_id: admin?.id, role: 'user' })
      .set('authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.err).toBe('You try to change yourself or the super admin');
  });

  test('Should return 200 and update role if the request is valid', async () => {
    const user = await UserModel.findOne({ email: 'user@mail.com' });

    let res = await request(app)
      .patch('/users/changeRole')
      .query({ user_id: user?.id, role: 'admin' })
      .set('authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.modifiedCount).toEqual(1);
    const updateUser = await UserModel.findOne({ email: 'user@mail.com' });
    expect(updateUser?.role).toBe('admin');
  });
});
