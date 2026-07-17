import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Casas from "./components/Casas";
import ComentariosPublicos from "./components/ComentariosPublicos";
import Footer from "./components/Footer";
import ChatBot from "./components/ChatBot";
import ScrollToTop from "./components/ScrollToTop";
import Propiedades from "./components/Propiedades";
import BookingPadre from "./components/Booking/BookinPadre";

import About from "./pages/About";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ChangePassword from "./pages/ChangePassword";
import AdminNewReservation from "./pages/AdminNewReservation";

/* =========================
  
// 🔐 PROTECCIÓN SIMPLE (EL CANDADO)
========================= */
function PrivateRoute({ children }) {
  const auth = localStorage.getItem("auth");
  return auth ? children : <Navigate to="/admin/login" />;
}

/* =========================
   HOME PUBLICO
========================= */
function Home({ language, setLanguage, openBooking, setOpenBooking }) {
  return (
    <>
      <Navbar
        setOpenBooking={setOpenBooking}
        language={language}
        setLanguage={setLanguage}
      />
      <Hero language={language} />
      <Casas language={language} />
      <ComentariosPublicos />
      <BookingPadre
        openBooking={openBooking}
        setOpenBooking={setOpenBooking}
        language={language}
      />
      <ChatBot />
      <ScrollToTop />
      <Footer language={language} />
    </>
  );
}

/* =========================
   APP
========================= */
function App() {
  const [language, setLanguage] = useState("es");
  const [openBooking, setOpenBooking] = useState(false);

  return (
    <Routes>
      {/* PUBLICO */}
      <Route
        path="/"
        element={
          <Home
            language={language}
            setLanguage={setLanguage}
            openBooking={openBooking}
            setOpenBooking={setOpenBooking}
          />
        }
      />

      <Route path="/about" element={<About />} />
      <Route path="/propiedades" element={<Propiedades />} />

      {/* LOGIN ADMIN */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* PROTEGIDAS */}
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/nueva-reserva"
        element={
          <PrivateRoute>
            <AdminNewReservation />
          </PrivateRoute>
        }
      />

      <Route
        path="/change-password"
        element={
          <PrivateRoute>
            <ChangePassword />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
