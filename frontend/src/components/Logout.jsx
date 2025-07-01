import React from "react";
import { auth } from "./../util/firebase";
import {signOut} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";


function Logout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully!");
      navigate("/"); // redirect to login page
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to logout. Try again.");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg shadow"
    >
      Logout
    </button>
  );
}

export default Logout;
