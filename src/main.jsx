import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { CartProvider }     from "./cart/CartContext.jsx";
import { LanguageProvider } from "./lang/LanguageContext.jsx";
import { AdminProvider }    from "./admin/AdminContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LanguageProvider>
      <AdminProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AdminProvider>
    </LanguageProvider>
  </StrictMode>
);
