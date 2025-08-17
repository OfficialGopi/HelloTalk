import DemoLayout from "@/app/DemoLayout";
import { LayoutLoader } from "@/components/loaders/Loaders";
import { server } from "@/constants/config";
import { userExists, userNotExists } from "@/redux/reducers/auth";
import axios from "axios";
import { lazy, Suspense, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

const Home = lazy(() => import("@/app/Home"));
const Authenticate = lazy(() => import("@/app/Authenticate"));

const NotFound = lazy(() => import("@/app/NotFound"));
const Router = () => {
  return (
    <Suspense fallback={<LayoutLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/authenticate" element={<Authenticate />} />
        <Route path="*" element={<NotFound />} />

        <Route path="/" element={<Home />} />
        <Route path="/chat/:chatId" element={<DemoLayout />} />

        <Route path="*" element={<NotFound />} />
      </Routes>

      <Toaster position="bottom-center" />
    </Suspense>
  );
};

export default Router;
