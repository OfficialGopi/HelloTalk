import { env } from "../../env";

const corsOptions = {
  origin: [env.CLIENT_URL, "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};

export { corsOptions };
