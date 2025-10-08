import type { Request, Response } from "express";
import { adapter } from '../config/botAdapterTeams.config';
import axios from 'axios'

const RAGAPIURL = process.env.FASTAPI_URL;

export default async function messageService(req: Request, res: Response) {
    try {
        console.log("On messageService");
        await adapter.processActivity(req, res, async (context) => {
            console.log('All context.activity objects: ', JSON.stringify(context.activity, null, 2));
            if (context.activity.type === 'message') {
                const header = {
                    headers: {
                        "Content-Type": "application/json"
                    },
                    timeout: 70000
                }

                const data = { "message": context.activity.text, "user_id": context.activity.from.id, "conversation_id": context.activity.conversation.id.toString(), "service_url": context.activity.serviceUrl }

                const response = await axios.post(`${RAGAPIURL}/ai/parse-command`, data, header)

                if (response.status == 200)
                    await context.sendActivity(`${JSON.stringify(response.data.response)}`);
                else {
                    console.error(`Status code ${response.status}`);
                    await context.sendActivity(`Could not get a response from rag system.`)
                }
            }
        });
    } catch (err: any) {
        console.error("Error in messageService: ", err);
        res.status(err.statusCode || 500).json({
            success: false,
            error: err.message,
            details: err.details || null
        });
    }
}