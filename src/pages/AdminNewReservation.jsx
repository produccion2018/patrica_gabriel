import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import BookingPadre from "../components/Booking/BookinPadre";

function AdminNewReservation() {
  const navigate = useNavigate();

  const [openBooking, setOpenBooking] = useState(true);

  useEffect(() => {
    if (!openBooking) {
      navigate("/admin");
    }
  }, [openBooking, navigate]);

  return (
    <BookingPadre openBooking={openBooking} setOpenBooking={setOpenBooking} />
  );
}

export default AdminNewReservation;
