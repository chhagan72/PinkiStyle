import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./pages/theme.css";

import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";

// Shopper Pages
import Home from "./pages/Home";
import Jeans from "./pages/Jeans";
import Tshirt from "./pages/Tshirt";
import Shirt from "./pages/Shirt";
import NightPant from "./pages/NightPant";
import Sport from "./pages/Sport";
import LadiesJeans from "./pages/LadiesJeans";
import Saree from "./pages/Saree";
import Blouse from "./pages/Blouse";
import Children from "./pages/Children";
import Men from "./pages/Men";
import LadiesTop from "./pages/LadiesTop";
import OldMan from "./pages/OldMan";
import ContactUs from "./pages/ContactUs";
import AboutUs from "./pages/AboutUs";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import CartPage from "./pages/CartPage";
import ProductGrid from "./components/ProductGrid";
import { CartProvider } from "./context/CartContext";
import ProductDetails from "./pages/ProductDetails";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";

// Admin Pages
import {
  AdminDashboard,
  SalesSummary,
  OrderStats,
  UserActivity,
  LowStockAlerts,
  TopSellingProducts,
  RecentOrders,
  Products,
  ProductNew,
  Media,
  Categories,
  Pricing,
  Inventory,
  Visibility,
  Orders,
  OrderStatus,
  Refunds,
  Invoices,
  Shipping,
  // New imports for your features
  AllUsers,
  ManageRoles,
  OrderHistory,
  // Payments,
  PaymentHistory,
  RefundProcessing,
  RevenueReports,
  Coupons,
  Banners,
  EmailNotifications,
  FeaturedProducts,
  Reviews,
  CustomerQueries,
  SalesReports,
  CustomerReports,
  InventoryReports,
  StoreSettings,
  TaxShippingSettings,
  PaymentGatewaySettings,
  SEOSettings,
  LanguageCurrencySettings,
  AdminLogs,
  ManagePermissions,
  BackupRestore,
  ProductEdit
} from "./admin";

// NEW: session-scoped auth helpers
import { auth } from "./utils/auth";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 992);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("EN");
  const [openMenus, setOpenMenus] = useState({});

  // const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  // const [role, setRole] = useState(localStorage.getItem("role") || "user");
  // const [user, setUser] = useState(() => {
  //   try {
  //     const raw = localStorage.getItem("user");
  //     return raw ? JSON.parse(raw) : null;
  //   } catch (e) {
  //     return null;
  //   }
  // });

  // IMPORTANT: initialize from sessionStorage via auth()
  const [isLoggedIn, setIsLoggedIn] = useState(!!auth.getToken());
  const [role, setRole] = useState(auth.getRole() || "user");
  const [user, setUser] = useState(auth.getUser());
  const products = []; // fetch from API

  // Responsive sidebar
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 992) {
        setSidebarOpen(true);
        setMobileOpen(false);
      } else {
        setSidebarOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Dark theme toggle
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  // Update role on login/logout
  useEffect(() => {
      setRole(auth.getRole() || "user");
      setUser(auth.getUser());
    }, [isLoggedIn]);

  // Translations (unchanged)
  const translations = {
    EN: {
      home: "Home",
      men: "Men",
      women: "Women",
      children: "Children",
      oldman: "Old Man",
      jeans: "Jeans",
      tshirt: "T-shirt",
      shirt: "Shirt",
      nightpant: "Night Pant",
      sport: "Sports",
      Saree: "Saree",
      blouse: "Blouse",
      ladiesjeans: "Ladies Jeans",
      ladiestop: "Ladies Top",
      childrenAll: "All Children",
      oldmancloth: "Old Man Cloth",
      contact: "Contact Us",
      about: "About Us",
      loginTitle: "Login",
      emailOrMobile: "Email or Mobile",
      password: "Password",
      loginBtn: "Login",
      noAccount: "Don't have an account?",
      registerHere: "Register",
      registerTitle: "Registration",
      firstName: "First Name",
      lastName: "Last Name",
      mobile: "Mobile No",
      email: "Email",
      address: "Full Address",
      registerBtn: "Register",
      haveAccount: "Already have an account?",
      loginHere: "Login",
      profile: "Profile",
      settings: "Settings",
      logout: "Logout",
      langEnglish: "English",
      langHindi: "Hindi",
      langMarathi: "Marathi",
      tagline: "Fashion & Comfort",
    },
    HI: {
      home: "होम ",
      men: "पुरुष",
      women: "महिला",
      children: "बच्चे",
      oldman: "बुजुर्ग",
      jeans: "जींस",
      tshirt: "टी-शर्ट",
      shirt: "शर्ट",
      nightpant: "नाइट पैंट",
      sport: "खेल",
      Saree: "साड़ी",
      blouse: "ब्लाउज",
      ladiesjeans: "लेडीज जींस टॉप",
      childrenAll: "सभी बच्चे",
      oldmancloth: "बुजुर्ग कपड़े",
      contact: "संपर्क करें",
      about: "हमारे बारे में",
      loginTitle: "लॉगिन",
      emailOrMobile: "ईमेल या मोबाइल",
      password: "पासवर्ड",
      loginBtn: "लॉगिन करें",
      noAccount: "क्या आपका अकाउंट नहीं है?",
      registerHere: "रजिस्टर करें",
      registerTitle: "रजिस्ट्रेशन",
      firstName: "पहला नाम",
      lastName: "अंतिम नाम",
      mobile: "मोबाइल नंबर",
      email: "ईमेल",
      address: "पूरा पता",
      registerBtn: "रजिस्टर",
      haveAccount: "क्या आपका अकाउंट है?",
      loginHere: "लॉगिन करें",
      profile: "प्रोफ़ाइल",
      settings: "सेटिंग्स",
      logout: "लॉगआउट",
      langEnglish: "अंग्रेज़ी",
      langHindi: "हिंदी",
      langMarathi: "मराठी",
      tagline: "फ़ैशन और आराम",
    },
    MR: {
      home: "होम ",
      men: "पुरुष",
      women: "स्त्रिया",
      children: "लहान मुले",
      oldman: "ज्येष्ठ नागरिक",
      jeans: "जीन्स",
      tshirt: "टी-शर्ट",
      shirt: "शर्ट",
      nightpant: "नाईट पॅन्ट",
      sport: "खेळ",
      Saree: "साडी",
      blouse: "ब्लाउज",
      ladiesjeans: "लेडीज जीन्स टॉप",
      childrenAll: "सर्व मुले",
      oldmancloth: "ज्येष्ठांचे कपडे",
      contact: "संपर्क",
      about: "आमच्याबद्दल",
      loginTitle: "लॉगिन",
      emailOrMobile: "ईमेल किंवा मोबाईल",
      password: "पासवर्ड",
      loginBtn: "लॉगिन करा",
      noAccount: "खाते नाही?",
      registerHere: "नोंदणी करा",
      registerTitle: "नोंदणी",
      firstName: "पहिले नाव",
      lastName: "आडनाव",
      mobile: "मोबाईल नंबर",
      email: "ईमेल",
      address: "संपूर्ण पत्ता",
      registerBtn: "नोंदणी",
      haveAccount: "आधीच खाते आहे?",
      loginHere: "लॉगिन करा",
      profile: "प्रोफाइल",
      settings: "सेटिंग्ज",
      logout: "लॉगआउट",
      langEnglish: "इंग्रजी",
      langHindi: "हिंदी",
      langMarathi: "मराठी",
      tagline: "फॅशन आणि आराम",
    },
  };

  const t = translations[language];

  // Shopper menu (hidden for admin)
  const userMenuItems = [
    { title: t.home, icon: "🏠", items: [{ label: t.home, path: "/home" }] },
    {
      title: t.men, icon: "👔",
      items: [
        { label: t.jeans, path: "/jeans" },
        { label: t.tshirt, path: "/tshirt" },
        { label: t.shirt, path: "/shirt" },
        { label: t.nightpant, path: "/night-pant" },
        { label: t.sport, path: "/sport" },
      ],
    },
    {
      title: t.women, icon: "👗",
      items: [
        { label: t.Saree, path: "/Saree" },
        { label: t.blouse, path: "/blouse" },
        { label: t.ladiesjeans, path: "/ladiesjeans" },
        { label: t.ladiestop, path: "/LadiesTop" },
      ],
    },
    { title: t.children, icon: "🧒", items: [{ label: t.childrenAll, path: "/children" }] },
    { title: t.oldman, icon: "👴", items: [{ label: t.oldmancloth, path: "/old-man" }] },
    { title: t.contact, icon: "📞", items: [{ label: t.contact, path: "/contact-us" }] },
    { title: t.about, icon: "ℹ️", items: [{ label: t.about, path: "/about-us" }] },
  ];

  // Admin menu (shown only for admin)
  const adminMenuItems = [
    {
      title: "Dashboard", icon: "📊",
      items: [
        { label: "Overview", path: "/admin" },
        { label: "Sales Summary", path: "/admin/sales-summary" },
        { label: "Order Statistics", path: "/admin/order-stats" },
        { label: "User Activity", path: "/admin/user-activity" },
        { label: "Low Stock Alerts", path: "/admin/low-stock" },
        { label: "Top Selling Products", path: "/admin/top-products" },
        { label: "Recent Orders List", path: "/admin/recent-orders" },
      ],
    },
    {
    title: "Product Management",
    icon: "🛒",
    items: [
      { label: "All Products", path: "/admin/products" },
      { label: "Add New Product", path: "/admin/products/new", component: ProductNew },
      { label: "Media Library", path: "/admin/media", component: Media },
      { label: "Categories", path: "/admin/categories", component: Categories },
      { label: "Pricing", path: "/admin/pricing", component: Pricing },
      { label: "Inventory", path: "/admin/inventory", component: Inventory },
      { label: "Visibility Settings", path: "/admin/visibility", component: Visibility }
    ]
  },
  {
    title: "Order Management",
    icon: "📦",
    items: [
      { label: "All Orders", path: "/admin/orders", component: Orders },
      { label: "Order Status", path: "/admin/order-status", component: OrderStatus },
      { label: "Refund Requests", path: "/admin/refunds", component: Refunds },
      { label: "Invoices", path: "/admin/invoices", component: Invoices },
      { label: "Shipping Settings", path: "/admin/shipping", component: Shipping }
    ]
  },
  {
    title: "User & Role Management",
    icon: "👤",
    items: [
      { label: "All Users", path: "/admin/users", component: AllUsers },
      { label: "Manage Roles", path: "/admin/roles", component: ManageRoles },
      { label: "Customer Order History", path: "/admin/order-history", component: OrderHistory }
    ]
  },
  {
    title: "Payments & Transactions",
    icon: "💳",
    items: [
      { label: "Payment History", path: "/admin/payment-history", component: PaymentHistory },
      { label: "Refund Processing", path: "/admin/refund-processing", component: RefundProcessing },
      { label: "Revenue & Tax Reports", path: "/admin/revenue-reports", component: RevenueReports }
    ]
  },
  {
    title: "Marketing & Promotions",
    icon: "📢",
    items: [
      { label: "Coupons / Discounts", path: "/admin/coupons", component: Coupons },
      { label: "Banners & Sliders", path: "/admin/banners", component: Banners },
      { label: "Email/SMS Notifications", path: "/admin/notifications", component: EmailNotifications },
      { label: "Featured Products", path: "/admin/featured-products", component: FeaturedProducts }
    ]
  },
  {
    title: "Reviews & Feedback",
    icon: "⭐",
    items: [
      { label: "Manage Reviews", path: "/admin/reviews", component: Reviews },
      { label: "Customer Queries", path: "/admin/queries", component: CustomerQueries }
    ]
  },
  {
    title: "Reports & Analytics",
    icon: "📈",
    items: [
      { label: "Sales Reports", path: "/admin/sales-reports", component: SalesReports },
      { label: "Customer Reports", path: "/admin/customer-reports", component: CustomerReports },
      { label: "Inventory Reports", path: "/admin/inventory-reports", component: InventoryReports }
    ]
  },
  {
    title: "Website Settings",
    icon: "⚙️",
    items: [
      { label: "Store Details", path: "/admin/store-settings", component: StoreSettings },
      { label: "Tax & Shipping", path: "/admin/tax-shipping", component: TaxShippingSettings },
      { label: "Payment Gateway", path: "/admin/payment-gateway", component: PaymentGatewaySettings },
      { label: "SEO Settings", path: "/admin/seo", component: SEOSettings },
      { label: "Language & Currency", path: "/admin/language-currency", component: LanguageCurrencySettings }
    ]
  },
  {
    title: "Security & Logs",
    icon: "🔒",
    items: [
      { label: "Admin Activity Logs", path: "/admin/logs", component: AdminLogs },
      { label: "Manage Permissions", path: "/admin/permissions", component: ManagePermissions },
      { label: "Backup & Restore", path: "/admin/backup-restore", component: BackupRestore }
    ]
  },
  ];

  function toggleMenu(index) {
    setOpenMenus((prev) => ({ ...prev, [index]: !prev[index] }));
  }

  // function handleLogout() {
  //   localStorage.removeItem("token");
  //   localStorage.removeItem("role");
  //   setIsLoggedIn(false);
  //   navigate("/login");
  // }
  function handleLogout() {
    auth.clearAll();
    setIsLoggedIn(false);
    setRole("user");
    setUser(null);
    navigate("/login");
  }

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  // Admin route guard
  // const RequireAdmin = ({ children }) => {
  //   const r = localStorage.getItem("role");
  //   if (r !== "admin") return <Navigate to="/login" replace />;
  //   return children;
  // };

   const RequireAdmin = ({ children }) => {
    if (!isLoggedIn || role !== "admin") return <Navigate to="/login" replace />;
    return children;
  };

  return (
     <CartProvider>
      <div className="app-root">
        <Topbar
          language={language}
          setLanguage={setLanguage}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          setSidebarOpen={setSidebarOpen}
          setMobileOpen={setMobileOpen}
          showProfile={!isAuthPage && isLoggedIn}
          onLogout={handleLogout}
          t={t}
          isAdmin={role === "admin"}
          user={user}
          hideCart={isAuthPage || role === "admin"}
          MyOrders={isAuthPage || role === "admin"}
        />

        {!isAuthPage && isLoggedIn && (
          <Sidebar
            sidebarOpen={sidebarOpen}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
            menuItems={role === "admin" ? adminMenuItems : userMenuItems}
            openMenus={openMenus}
            toggleMenu={toggleMenu}
            t={t}
          />
        )}

        

        <main
          className={`main-content ${
            sidebarOpen && !isAuthPage && isLoggedIn ? "with-sidebar" : ""
          }`}
        >
          <div className="container-fluid py-4">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setUser={setUser} t={t} />} />
              <Route path="/register" element={<Register t={t} />} />
              <Route path="/" element={<Navigate to="/login" />} />

              {/* Private routes (shopper) */}
              {isLoggedIn && role !== "admin" && (
                <>
                  <Route path="/home" element={<Home />} />
                  <Route path="/jeans" element={<Jeans />} />
                  <Route path="/tshirt" element={<Tshirt />} />
                  <Route path="/shirt" element={<Shirt />} />
                  <Route path="/night-pant" element={<NightPant />} />
                  <Route path="/sport" element={<Sport />} />
                  <Route path="/ladiesjeans" element={<LadiesJeans/>} />
                  <Route path="/Saree" element={<Saree />} />
                  <Route path="/blouse" element={<Blouse />} />
                  <Route path="/children" element={<Children />} />
                  <Route path="/men" element={<Men />} />
                  <Route path="/LadiesTop" element={<LadiesTop />} />
                  <Route path="/old-man" element={<OldMan />} />
                  <Route path="/contact-us" element={<ContactUs />} />
                  <Route path="/about-us" element={<AboutUs />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/" element={<ProductGrid products={products} />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/my-orders" element={<MyOrders />} />
                  <Route path="/order/:id" element={<OrderDetails />} />
                  {/* <Route path="/order/:orderId/product/:productId" element={<OrderDetails />} /> */}
                </>
              )}

              {/* Admin routes */}
              {isLoggedIn && role === "admin" && (
                <>
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
                  <Route path="/admin/sales-summary" element={<RequireAdmin><SalesSummary /></RequireAdmin>} />
                  <Route path="/admin/order-stats" element={<RequireAdmin><OrderStats /></RequireAdmin>} />
                  <Route path="/admin/user-activity" element={<RequireAdmin><UserActivity /></RequireAdmin>} />
                  <Route path="/admin/low-stock" element={<RequireAdmin><LowStockAlerts /></RequireAdmin>} />
                  <Route path="/admin/top-products" element={<RequireAdmin><TopSellingProducts /></RequireAdmin>} />
                  <Route path="/admin/recent-orders" element={<RequireAdmin><RecentOrders /></RequireAdmin>} />

                  <Route path="/admin/products" element={<RequireAdmin><Products /></RequireAdmin>} />
                  <Route path="/admin/products/new" element={<RequireAdmin><ProductNew /></RequireAdmin>} />
                  <Route path="/admin/products/media" element={<RequireAdmin><Media /></RequireAdmin>} />
                  <Route path="/admin/categories" element={<RequireAdmin><Categories /></RequireAdmin>} />
                  <Route path="/admin/pricing" element={<RequireAdmin><Pricing /></RequireAdmin>} />
                  <Route path="/admin/inventory" element={<RequireAdmin><Inventory /></RequireAdmin>} />
                  <Route path="/admin/visibility" element={<RequireAdmin><Visibility /></RequireAdmin>} />

                  <Route path="/admin/orders" element={<RequireAdmin><Orders /></RequireAdmin>} />
                  <Route path="/admin/orders/update-status" element={<RequireAdmin><OrderStatus /></RequireAdmin>} />
                  <Route path="/admin/orders/refunds" element={<RequireAdmin><Refunds /></RequireAdmin>} />
                  <Route path="/admin/invoices" element={<RequireAdmin><Invoices /></RequireAdmin>} />
                  <Route path="/admin/shipping" element={<RequireAdmin><Shipping /></RequireAdmin>} />

                  <Route path="/admin/users" element={<RequireAdmin><AllUsers /></RequireAdmin>} />
                  <Route path="/admin/roles" element={<RequireAdmin><ManageRoles /></RequireAdmin>} />
                  <Route path="/admin/order-history" element={<RequireAdmin><OrderHistory /></RequireAdmin>} />
                  
                  <Route path="/admin/payment-history" element={<RequireAdmin><PaymentHistory /></RequireAdmin>} />
                  <Route path="/admin/refund-processing" element={<RequireAdmin><RefundProcessing /></RequireAdmin>} />
                  <Route path="/admin/revenue-reports" element={<RequireAdmin><RevenueReports /></RequireAdmin>} />

                  <Route path="/admin/coupons" element={<RequireAdmin><Coupons /></RequireAdmin>} />
                  <Route path="/admin/banners" element={<RequireAdmin><Banners /></RequireAdmin>} />
                  <Route path="/admin/notifications" element={<RequireAdmin><EmailNotifications /></RequireAdmin>} />
                  <Route path="/admin/featured-products" element={<RequireAdmin><FeaturedProducts /></RequireAdmin>} />

                  <Route path="/admin/reviews" element={<RequireAdmin><Reviews /></RequireAdmin>} />
                  <Route path="/admin/queries" element={<RequireAdmin><CustomerQueries /></RequireAdmin>} />

                  <Route path="/admin/sales-reports" element={<RequireAdmin><SalesReports /></RequireAdmin>} />
                  <Route path="/admin/customer-reports" element={<RequireAdmin><CustomerReports /></RequireAdmin>} />
                  <Route path="/admin/inventory-reports" element={<RequireAdmin><InventoryReports /></RequireAdmin>} />

                  <Route path="/admin/store-settings" element={<RequireAdmin><StoreSettings /></RequireAdmin>} />
                  <Route path="/admin/tax-shipping" element={<RequireAdmin><TaxShippingSettings /></RequireAdmin>} />
                  <Route path="/admin/payment-gateway" element={<RequireAdmin><PaymentGatewaySettings /></RequireAdmin>} />
                  <Route path="/admin/seo" element={<RequireAdmin><SEOSettings /></RequireAdmin>} />
                  <Route path="/admin/language-currency" element={<RequireAdmin><LanguageCurrencySettings /></RequireAdmin>} />

                  <Route path="/admin/logs" element={<RequireAdmin><AdminLogs /></RequireAdmin>} />
                  <Route path="/admin/permissions" element={<RequireAdmin><ManagePermissions /></RequireAdmin>} />
                  <Route path="/admin/backup-restore" element={<RequireAdmin><BackupRestore /></RequireAdmin>} />
                  <Route path="/admin/products/:id/edit" element={<ProductEdit/>} />

                </>
              )}

              {/* Fallback */}
            <Route path="*" element={<Navigate to={isLoggedIn ? (role === "admin" ? "/admin" : "/home") : "/login"} />} />
            </Routes>
          </div>
        </main>
      </div>
    </CartProvider>
  );
}
