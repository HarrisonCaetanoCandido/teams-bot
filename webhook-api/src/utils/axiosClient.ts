import CacheableLookup from "cacheable-lookup";
import http from "http";
import https from "https";
import axios from "axios";

const cacheable = new CacheableLookup();
cacheable.install(http.globalAgent);
cacheable.install(https.globalAgent);

const agent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 30000,
  maxSockets: 5,
  timeout: 70000,
});

export const axiosClient = axios.create({
  httpsAgent: agent,
});
