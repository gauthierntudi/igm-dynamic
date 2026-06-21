"use client";

import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

/** Conteneur global — z-index au-dessus de la modal signalement (~10050). */
export default function IgToastContainer() {
  return (
    <ToastContainer
      position="top-center"
      autoClose={7000}
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
      limit={5}
      style={{ zIndex: 20000 }}
    />
  );
}
