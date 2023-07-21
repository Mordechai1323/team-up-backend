import express from 'express';
const app = express();
import path from 'path';
import http from 'http';
import cors from 'cors';
import { corsOptions } from './config/corsOptions';
import cookieParser from 'cookie-parser';
import { credentials } from './middleware/credentials';
import { connectDB } from './config/dbConnect';
const port = process.env.PORT || 3002;

import register from './routes/register';
import login from './routes/login';
import refresh from './routes/refresh';
import logout from './routes/logout';

import users from './routes/api/users';
import boards from './routes/api/boards';
import groups from './routes/api/groups';
import tasks from './routes/api/tasks';
import teams from './routes/api/teams';


connectDB();

app.use(credentials);

app.use(cors(corsOptions));

app.use(express.json());

app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/register', register);
app.use('/login', login);
app.use('/refresh', refresh);
app.use('/logout', logout);

app.use('/users', users);
app.use('/boards', boards);
app.use('/groups', groups);
app.use('/tasks', tasks);
app.use('/teams', teams);

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`server run on port ${port}`);
});
