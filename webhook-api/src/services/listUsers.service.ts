import type { Request, Response } from "express";
import axios from "axios";

export default async function listUsers(req: Request, res: Response) {
    try {
        console.log("On listUsers Service")
        const domain_url = 'https://jsonplaceholder.typicode.com/'
        const header = {
            headers: {
                "Context-Type": "application/json"
            },
            timeout: 10000
        }

        const sys_response = await axios.get(`${domain_url}/users`, header)

        if (sys_response.status == 200)
            console.log("Sys_response status code: ", sys_response.status);
        else
            console.error("Sys_response status code: ", sys_response.status)

        res.status(200).json({
            success: true,
            message: 'On listUsers',
            data: sys_response ? sys_response.data : "No data extracted from sys_api"
        });
    } catch (err: any) {
        console.error("Could not complete listUsers: ", err);
    }
}