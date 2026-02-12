// src/routes/router.tsx
import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";

import Home from "../pages/Home";
import Products from "../pages/Products";
import ProductDetails from "../pages/ProductDetails";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import OrderSuccess from "../pages/OrderSuccess";
import NotFound from "../pages/NotFound";

// ✅ Auth pages
import Login from "../pages/Login";
import Register from "../pages/Register";
import Account from "../pages/Account";
import RequireAuth from "../components/auth/RequireAuth";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/products", element: <Products /> },
      { path: "/products/:id", element: <ProductDetails /> },
      { path: "/cart", element: <Cart /> },
      { path: "/checkout", element: <Checkout /> },

      // ✅ Sprint 5: Auth routes
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      {
        path: "/account",
        element: (
          <RequireAuth>
            <Account />
          </RequireAuth>
        ),
      },

      { path: "/order-success", element: <OrderSuccess /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
