const cookieOptions = {
  sameSite: "none",
  httpOnly: true,
  secure: true,
};

const tokenFieldNames = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  adminAccessToken: "admin-access-token",
  adminRefreshToken: "admin-refresh-token",
};

export { cookieOptions, tokenFieldNames };
