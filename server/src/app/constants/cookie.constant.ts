const cookieOptions = {
  sameSite: "none",
  httpOnly: true,
  secure: true,
};

const tokenFieldNames = {
  userToken: "user-token",
  adminToken: "admin-token",
};

export { cookieOptions, tokenFieldNames };
