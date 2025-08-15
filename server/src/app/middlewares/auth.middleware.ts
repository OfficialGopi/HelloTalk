import { AsyncHandler } from "../utils/async-handler.util";

const checkUserIfLoggedIn = AsyncHandler(async (req, res, next) => {
  //TODO

  next();
});

const isAdmin = AsyncHandler(async (req, res, next) => {
  //TODO
});

export { checkUserIfLoggedIn, isAdmin };
