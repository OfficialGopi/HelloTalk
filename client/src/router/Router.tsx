import DemoLayout from "@/app/DemoLayout";
import { LayoutLoader } from "@/components/loaders/Loaders";
import { lazy, Suspense } from "react";

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
        <Route path="/demo" element={<DemoLayout />} />

        <Route path="*" element={<NotFound />} />
      </Routes>

      <Toaster position="bottom-center" />
    </Suspense>
  );
};

export default Router;
