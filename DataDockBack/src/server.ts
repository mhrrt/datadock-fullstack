import dotenv from "dotenv";
// its itensional, first need to execute dotenv.config() else databaseurl becomes undefine
dotenv.config();


import app from "./app";


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
