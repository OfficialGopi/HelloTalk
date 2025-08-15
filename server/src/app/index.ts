import express from "express";
import { errorMiddleware } from "./middlewares/error.middlewarre";

const app = express();

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

//CORS
import cors from "cors";
import { corsOptions } from "./constants/cors.constants";

app.use(cors(corsOptions));

//Apis
import userRouter from "./routes/user.routes";
import chatRouter from "./routes/chat.routes";
import adminRouter from "./routes/admin.routes";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/admin", adminRouter);

//Error handling middleware
app.use(errorMiddleware);

export default app;
