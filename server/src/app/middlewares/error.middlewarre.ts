import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/response.util";

function errorMiddleware(
  error: ApiError,
  _: Request,
  res: Response,
  __: NextFunction,
) {
  error.statusCode ||= 500; //Default Status code is 500
  error.success ||= false; //Success is false
  error.message ||= "Internal Server Error"; //Error message
  error.errors ||= []; //Errors

  //RETURN RESPONSE
  res.status(error.statusCode).json({
    statusCode: error.statusCode,
    success: error.success,
    message: error.message,
    errors: error.errors,
  });
}

export { errorMiddleware };
