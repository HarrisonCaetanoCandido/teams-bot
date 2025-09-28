import type { Request, Response } from "express";
import { adapter } from '../config/botAdapterTeams.config';
import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config();

const RAGAPIURL = process.env.FASTAPI_URL;

function isLocalTest(activity: any): boolean {
    return activity.channelId === 'emulator' ||
        activity.serviceUrl?.includes('localhost') ||
        activity.serviceUrl?.includes('ngrok');
}

export default async function messageService(req: Request, res: Response) {
    try {
        console.log("On messageService");
        adapter.processActivity(req, res, async (context) => {
            if (context.activity.type === 'message') {
                const userMessage = context.activity.text;

                if (isLocalTest(context.activity)) {
                    // LOCAL: RESPOSTA VIA HTTP
                    const botResponse = `Olá! Recebi sua mensagem: "${userMessage}". Em breve vou integrar com IA!`;

                    const header = {
                        headers: {
                            "Content-Type": "application/json"
                        },
                        timeout: 15000
                    }

                    const data = { "message": context.activity.text, "user_id": context.activity.from.id }

                    // CALL RAG SYSTEM, note que ele roda em ipv4
                    const response = await axios.post(`${RAGAPIURL}/ai/parse-command`, data, header)

                    if (response.status == 200)
                        await context.sendActivity(`${JSON.stringify(response.data.response)}`);
                    else
                        console.error(`Status code ${response.status}`);
                } else {
                    // PROD: RESPOSTA VIA TEAMS
                    await context.sendActivity(`Olá! Recebi sua mensagem: "${userMessage}". Em breve vou integrar com IA!`);
                }
            }
        });

    } catch (err: any) {
        console.error("Error in messageService: ", err);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: err.message
        });
    }
}