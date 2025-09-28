import express from 'express';
import { commandsRouter } from './commands.routes';
import { messageRouter } from './message.routes';

export const router = express.Router();

router.use('/', messageRouter);
router.use('/commands', commandsRouter);