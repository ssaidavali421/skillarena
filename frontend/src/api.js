
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json"
  }
});

export const getContests = () => API.get("/contests");

export const joinContest = (id) =>
  API.post(`/contests/${id}/join`);

export const getProblems = () => API.get("/problems");

export const submitAnswer = (data) =>
  API.post("/submissions", data);

export const getSubmissions = () =>
  API.get("/submissions");

export const getLeaderboard = () =>
  API.get("/leaderboard");

export const getAnalytics = () =>
  API.get("/analytics");

export default API;
