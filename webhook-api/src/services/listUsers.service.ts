import type { Request, Response } from "express";
import { axiosGetWithRetry } from "../utils/retry.js";

export default async function listUsers(req: Request, res: Response) {
  try {
    console.log("On listUsers Service");
    const domain_url = "https://jsonplaceholder.typicode.com";
    const config = {
      headers: { "Content-Type": "application/json" },
      timeout: 15000,
    };

    const sys_response = await axiosGetWithRetry(`${domain_url}/users`, config);

    res.status(200).json({
      success: true,
      message: "On listUsers",
      data: sys_response ? sys_response.data : "No data extracted from sys_api",
    });
  } catch (err: any) {
    console.error("Could not complete listUsers: ", err);
  }
}
