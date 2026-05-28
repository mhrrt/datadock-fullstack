import axios from "axios";

const AUTH_API = "http://localhost:5000/auth";

export async function login(username: string, password: string) {
  const response = await axios.post(`${AUTH_API}/login`, {
    username,
    password,
  });

  return response.data;
}
