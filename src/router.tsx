import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import { Suspense } from "react";
import DashboardLayout from "./layouts/DashboardLayout";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";
import {
  Dashboard,
  Leaderboard,
  Marketplace,
  MarketplaceProductDetails,
  OrderPage,
  ProductsNew,
  RouteLoading,
  Settings,
  SignIn,
  SignUp,
} from "./routePages";
import NotFound from "./Pages/NotFound";
import ErrorFallback from "./Pages/ErrorFallback";

export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorFallback />,
    element: <Navigate to="/dashboard" replace />,
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
        element: (
          <Suspense fallback={<RouteLoading />}>
            <Dashboard />
          </Suspense>
        ),
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
        path: "leaderboard/orders/:orderId",
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

  // Catch-all 404 route
  {
    path: "*",
    element: <NotFound />,
  },
]);