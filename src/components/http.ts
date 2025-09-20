import axios from "axios";
import { apiUrl } from "~/appConfig";

export const http = axios.create({ baseURL: apiUrl, headers: { "Content-Type": "application/json" }, withCredentials: true });
