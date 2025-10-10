import express from "express";
import { commandsRouter } from "./commands.routes.js";
import { messageRouter } from "./message.routes.js";

export const router = express.Router();

router.use("/", messageRouter);
router.use("/commands", commandsRouter);
