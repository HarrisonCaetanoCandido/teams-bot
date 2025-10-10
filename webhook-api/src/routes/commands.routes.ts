import express from "express";
import listUsers from "../services/listUsers.service.js";
import executeFlow from "../controller/executeFlow.controller.js";
import getTaskStatus from "../services/getTaskStatus.service.js";

export const commandsRouter = express.Router();

commandsRouter.get("/list-users", listUsers);
commandsRouter.post("/execute-flow", executeFlow);
commandsRouter.get("/get-task-status", getTaskStatus);
