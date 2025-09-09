import express from "express";

const app = express();

app.use(express.static("dist"));

app.use((_req, res) => {
  res.sendFile("/index.html");
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
