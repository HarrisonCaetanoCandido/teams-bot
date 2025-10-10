import { axiosClient } from "../utils/axiosClient.js";

export async function axiosGetWithRetry(
  url: string,
  header: any,
  retries = 7,
  delay = 5000
): Promise<any> {
  let attempt = 0;

  while (attempt < retries) {
    try {
      return await axiosClient.get(url, header).then((res) => {
        console.log(`Response status: ${res.status}`);
        console.log(`Data: ${JSON.stringify(res.data)}`);
      });
    } catch (err: any) {
      attempt++;
      if (attempt >= retries) throw err;
      const backoff = delay * Math.pow(2, attempt - 1);
      header.timeout += backoff * 2;
      console.warn(
        `Attempt ${attempt} failed. Retrying in ${backoff}ms with timeout of ${header.timeout}ms...`
      );
      await new Promise((res) => setTimeout(res, backoff));
    }
  }
}

export async function axiosTeamsPostWithRetry(
  url: string,
  convoId: string,
  data: any,
  header: any,
  retries = 3,
  delay = 5000
): Promise<void> {
  let attempt = 0;

  while (attempt < retries) {
    try {
      return await axiosClient.post(url, data, header).then((res) => {
        console.log(
          `Notified conversation ${convoId} of completion. Status: ${res.status}`
        );
      });
    } catch (err: any) {
      attempt++;
      if (attempt >= retries) throw err;
      const backoff = delay * Math.pow(2, attempt - 1);
      console.warn(`Attempt ${attempt} failed. Retrying in ${backoff}ms...`);
      await new Promise((res) => setTimeout(res, backoff));
    }
  }
}
