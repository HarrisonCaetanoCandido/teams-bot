import type { Request, Response } from "express";
import axios from 'axios'

export default async function getTaskStatus(req: Request, res: Response) {
    try {
        console.log("On getTaskStatus Service")

        const header = {
            headers: {
                "Content-Type": "application/json"
            }
        }
        const response = await axios.get('https://jsonplaceholder.typicode.com/todos', header);

        if (response.status == 200)
            res.status(200).json({
                success: true,
                message: 'On getTaskStatus',
                data: response.data ? response.data : 'Could not extract data from endpoint'
            });
        else
            res.status(response.status).json({
                success: false,
                message: 'On getTaskStatus',
                details: response.data
            });
    } catch (err: any) {
        console.error("Could not complete getTaskStatus: ", err);
    }
}