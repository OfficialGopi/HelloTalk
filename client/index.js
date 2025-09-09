import express from "express";
import path from "path";
const app = express();

app.use(express.static("dist"));

app.use((_req, res) => {
  res.sendFile(path.resolve("dist", "index.html"));
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
