import express from 'express';
import listUsers from '../services/listUsers.service';
import executeFlow from '../controller/executeFlow.controller';
import getTaskStatus from '../services/getTaskStatus.service';

export const commandsRouter = express.Router();

commandsRouter.get('/list-users', listUsers);
commandsRouter.post('/execute-flow', executeFlow);
commandsRouter.get('/get-task-status', getTaskStatus);