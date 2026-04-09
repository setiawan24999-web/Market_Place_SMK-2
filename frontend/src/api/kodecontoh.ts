import axios from "axios";
const api = axios.create({
    baseURL: "http://localhost:8000/users",
    headers: {"contenType": "aplication/json"},
});
export default api;