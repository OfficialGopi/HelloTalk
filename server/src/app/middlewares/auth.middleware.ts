import { AsyncHandler } from "../utils/async-handler.util";

const checkUserIfLoggedIn = AsyncHandler(async (req, res, next) => {
  //TODO

  next();
});

export { checkUserIfLoggedIn };
