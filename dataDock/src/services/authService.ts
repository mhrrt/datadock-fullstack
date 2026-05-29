import axios from "axios";

// Local
// const AUTH_API = "http://localhost:5000/auth";
// remote
const AUTH_API = `${import.meta.env.VITE_API_URL}/auth`;

export async function login(username: string, password: string) {
  const response = await axios.post(`${AUTH_API}/login`, {
    username,
    password,
  });

  return response.data;
}
