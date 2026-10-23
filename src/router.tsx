import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import { Suspense } from "react";
import DashboardLayout from "./layouts/DashboardLayout";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";
import {
  ForgotPassword,
  Leaderboard,
  Marketplace,
  MarketplaceProductDetails,
  MyStore,
  OrderPage,
  ProductsNew,
  PublicHome,
  RouteLoading,
  ResetPassword,
  Settings,
  SignIn,
  SignUp,
} from "./routePages";
import NotFound from "./Pages/NotFound";
import ErrorFallback from "./Pages/ErrorFallback";
import EditorRouteWrapper from "./components/routing/EditorRouteWrapper";

export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorFallback />,
    element: (
      <PublicRoute>
        <Suspense fallback={<RouteLoading />}>
          <PublicHome />
        </Suspense>
      </PublicRoute>
    ),
  },

  {
    path: "/signin",
    errorElement: <ErrorFallback />,
    element: (
      <PublicRoute>
        <Suspense fallback={<RouteLoading />}>
          <SignIn />
        </Suspense>
      </PublicRoute>
    ),
  },

  {
    path: "/signup",
    errorElement: <ErrorFallback />,
    element: (
      <PublicRoute>
        <Suspense fallback={<RouteLoading />}>
          <SignUp />
        </Suspense>
      </PublicRoute>
    ),
  },

  {
    path: "/forgot-password",
    errorElement: <ErrorFallback />,
    element: (
      <PublicRoute>
        <Suspense fallback={<RouteLoading />}>
          <ForgotPassword />
        </Suspense>
      </PublicRoute>
    ),
  },

  {
    path: "/reset-password",
    errorElement: <ErrorFallback />,
    element: (
      <Suspense fallback={<RouteLoading />}>
        <ResetPassword />
      </Suspense>
    ),
  },

  {
    path: "/dashboard",
    errorElement: <ErrorFallback />,
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="home" replace />,
      },

      {
        path: "home",
        errorElement: <ErrorFallback />,
        lazy: async () => {
          const { default: DashboardPage } = await import("./Pages/dashboard/Dashboard");
          return { Component: DashboardPage };
        },
      },
{
  path: "products/new",
          errorElement: <ErrorFallback />,

  element: (
    <Suspense fallback={<RouteLoading />}>
      <ProductsNew />
    </Suspense>
  ),
},
      {
        path: "settings",
        errorElement: <ErrorFallback />,
        element: (
          <Suspense fallback={<RouteLoading />}>
            <Settings />
          </Suspense>
        ),
      },
      {
        path: "store",
        errorElement: <ErrorFallback />,
        element: (
          <Suspense fallback={<RouteLoading />}>
            <MyStore />
          </Suspense>
        ),
      },
       {
        path: "leaderboard",
        errorElement: <ErrorFallback />,
        element: (
          <Suspense fallback={<RouteLoading />}>
            <Leaderboard />
          </Suspense>
        ),
      },
      {
        path: "orders/:orderId",
        errorElement: <ErrorFallback />,
        element: (
          <Suspense fallback={<RouteLoading />}>
            <OrderPage />
          </Suspense>
        ),
      },
      {
        path: "leaderboard/orders/:storeOrderId",
        errorElement: <ErrorFallback />,
        element: (
          <Suspense fallback={<RouteLoading />}>
            <OrderPage />
          </Suspense>
        ),
      },
       {
        path: "marketplace",
        errorElement: <ErrorFallback />,
        element: (
          <Suspense fallback={<RouteLoading />}>
            <Marketplace />
          </Suspense>
        ),
      },
       {
        path: "/dashboard/marketplace/:productId",
        errorElement: <ErrorFallback />,
        element: (
          <Suspense fallback={<RouteLoading />}>
            <MarketplaceProductDetails />
          </Suspense>
        ),
      },
      
    ],
  },

  {
    path: "/editeur/:slug",
    errorElement: <ErrorFallback />,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<RouteLoading />}>
          <EditorRouteWrapper />
        </Suspense>
      </ProtectedRoute>
    ),
  },

  // Catch-all 404 route
  {
    path: "*",
    element: <NotFound />,
  },
]);