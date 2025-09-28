import express from "express";
import messageService from "../services/message.service";

export const messageRouter = express.Router();

messageRouter.post('/messages', messageService);
