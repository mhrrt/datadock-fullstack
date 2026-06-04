import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import recordRoutes from "./routes/record.routes";
import authRoutes from "./routes/auth";
import stateRoutes from "./routes/stateRoutes";
import cityRoutes from "./routes/cityRoutes";
import pincodeRoutes from "./routes/pincodeRoutes";

const app = express();

// Middleware
// app.use(cors());
// temp commet to allow everything
// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173",
//       "https://datadock-fullstack.vercel.app/",
//     ],
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     credentials: true,
//   }),
// );
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/api/records", recordRoutes);
app.use("/states", stateRoutes);
app.use("/cities", cityRoutes);
app.use("/pincodes", pincodeRoutes);

// Health Check
app.get("/", (_, res) => {
  res.send("DataDock API Running");
});

export default app;
