import express from "express";
import messageService from "../services/message.service.js";

export const messageRouter = express.Router();

messageRouter.post("/messages", messageService);
