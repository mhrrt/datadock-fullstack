import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000,
});

export async function fetchRecords(params: {
  page: number;
  limit: number;
  search?: string;
}) {
  const response = await api.get("/records", {
    params,
  });

  return response.data;
}
