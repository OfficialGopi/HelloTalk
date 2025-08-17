import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Router from "@/router/Router";
import { Provider } from "react-redux";
import store from "@/redux/store";
import ThemeProvider from "./lib/ThemeProvider";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <BrowserRouter>
      <ThemeProvider>
        <Router />
      </ThemeProvider>
    </BrowserRouter>
  </Provider>
);
