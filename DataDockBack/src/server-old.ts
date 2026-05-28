import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Backend Running");
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Serve running on port ${PORT}`);
});