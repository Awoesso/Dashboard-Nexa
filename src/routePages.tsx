import { lazy } from "react";

export const PublicHome = lazy(() => import("./Pages/home/PublicHome"));
export const ProductsNew = lazy(() => import("./Pages/products/ProductsNew"));
export const MarketplaceProductDetails = lazy(
  () => import("@/Pages/marketplace/MarketplaceProductDetails")
);
export const OrderPage = lazy(() => import("./Pages/leaderboard/OrderPage"));
export const Leaderboard = lazy(() => import("./Pages/leaderboard/Leaderboard"));
export const Dashboard = lazy(() => import("./Pages/dashboard/Dashboard"));
export const Settings = lazy(() => import("./Pages/settings/Settings"));
export const MyStore = lazy(() => import("./Pages/store/MyStore"));
export const DskStoreEditorView = lazy(() => import("./views/DskStoreEditorView"));
export const Marketplace = lazy(() => import("./Pages/marketplace/Marketplace"));
export const SignIn = lazy(() => import("./Pages/auth/SignIn"));
export const SignUp = lazy(() => import("./Pages/auth/SignUp"));

export const RouteLoading = () => (
  <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">
   
  </div>
);
