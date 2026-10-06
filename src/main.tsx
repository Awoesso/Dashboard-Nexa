import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import "./index.css";
import { router } from "./router";
import { AuthcontextProvider } from "./Context/Authcontext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ProfileProvider } from "./Context/ProfileContext";

import { registerServiceWorker } from "./lib/registerServiceWorker";

void registerServiceWorker();

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthcontextProvider>
        <ProfileProvider>
          <RouterProvider router={router} />
        </ProfileProvider>
      </AuthcontextProvider>
    </ErrorBoundary>
  </React.StrictMode>
);