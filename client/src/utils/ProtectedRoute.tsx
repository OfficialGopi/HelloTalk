import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectRoute = ({
  children,
  user,
  redirect = "/authenticate",
}: {
  children?: React.ReactNode;
  user?: any;
  redirect?: string;
}) => {
  if (!user) return <Navigate to={redirect} />;

  return children ? children : <Outlet />;
};

export default ProtectRoute;
