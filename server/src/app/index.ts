import express from "express";
import { errorMiddleware } from "./middlewares/error.middlewarre";

const app = express();

//Apis

//Error handling middleware
app.use(errorMiddleware);

export default app;
