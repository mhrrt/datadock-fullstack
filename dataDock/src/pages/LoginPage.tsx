import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { login } from "../services/authService";

export default function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  localStorage.clear();
  console.log("local storage clear");

  const handleLogin = async () => {
    try {
      const data = await login(username, password);

      localStorage.setItem("token", data.token);
      //saving user.id to local that will be use while create and edit of customer record
      // localStorage.setItem("createdBy", data.user.id);
      // alert(`token generated: ${data.token}`);
      navigate("/search/true");
    } catch (error) {
      console.error(error);
      alert(`Login failed with error: ${error}`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-96 rounded bg-white p-6 shadow">
        <h2 className="mb-4 text-2xl font-bold">Login</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-4 w-full rounded border p-2"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded border p-2"
        />

        <button
          onClick={handleLogin}
          className="w-full rounded bg-blue-600 p-2 text-white"
        >
          Login
        </button>
      </div>
    </div>
  );
}
