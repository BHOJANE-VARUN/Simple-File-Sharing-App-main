// import React, { useEffect, useRef } from "react";
// import { auth } from "./../util/firebase";
// import { onAuthStateChanged } from "firebase/auth";
// import { io } from "socket.io-client";
// const socket = io("http://localhost:3001", {
//   transports: ["websocket"],
//   withCredentials: true,
// });

// function Home() {
//   const [user, setUser] = React.useState(null);
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setUser(user);
//       } else {
//         setUser(null);
//       }
//     });
//     return () => unsubscribe();
//   }, []);
//   const searchText = useRef(null);
//   const [messages, setMessages] = React.useState([]);

//   const handlclick = () => {
//   const message = searchText.current.value;
//   console.log(message);
//   if (message) {
//     socket.emit("message", message); // Send the message to the server
//     searchText.current.value = ""; // Clear the input field after sending the message
//   }
// };
// socket.on("message", (msg) => {
//   setMessages((prevMessages) => [...prevMessages, msg]);
// });
//   return (
//     <div>

//     </div>
//   );
// }

// export default Home;

// import { button } from "@/components/ui/button";
// import { div, div, div, div, div } from "@/components/ui/div";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Share2, Users, Upload, Download } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
import { LuUsers } from "react-icons/lu";
import React, { useEffect } from "react";
import { useState } from "react";
import Logo from "./Logo";
import { FiUpload } from "react-icons/fi";
import { COMPANY_NAME } from "../util/Constants";
import CreateRoom from "./CreateRoom";
import JoinRoom from "./JoinRoom";
import { auth } from "../util/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Logout from "./Logout";

const Home = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [userDetails, setUserDetails] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserDetails({
          name: user.displayName || "Anonymous",
          email: user.email,
        });
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, []);
  return (
    <div className="min-h-screen bg-indigo-50 ">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-between items-center mb-10 p-4">
            <div className="flex items-center justify-center mb-4">
              <Logo size={"80"} />
              <h1 className="text-4xl font-bold">{COMPANY_NAME}</h1>
            </div>
            <Logout />
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Secure file sharing made simple. Create a room or join one to start
            sharing files instantly.
          </p>
        </div>

        {/* Navigation Tabs */}
        {activeTab !== "home" && (
          <div className="flex justify-center mb-5">
            <button
              type="button"
              onClick={() => setActiveTab("home")}
              className="text-indigo-600 hover:text-indigo-800 cursor-pointer font-semibold text-lg"
            >
              ← Back to Home
            </button>
          </div>
        )}

        {/* Home View */}
        {activeTab === "home" && (
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Create Room div */}
              <div className="hover:shadow-2xl  border-0 shadow-lg bg-white/80 p-10 rounded-xl">
                <div className="text-center pb-4">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiUpload className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    Create Room
                  </div>
                  <div className="text-gray-600">
                    Start a new file sharing session and get a unique room code
                  </div>
                </div>
                <div className="text-center pt-4">
                  <button
                    onClick={() => setActiveTab("create")}
                    className="w-full bg-green-400 hover:bg-green-600 cursor-pointer  text-white font-semibold py-3 rounded-lg"
                    size="lg"
                  >
                    Create New Room
                  </button>
                </div>
              </div>

              <div className=" hover:shadow-2xl border-0 shadow-lg bg-white/80 p-10 rounded-xl">
                <div className="text-center pb-4">
                  <div className="w-16 h-16 bg-blue-500  rounded-full flex items-center justify-center mx-auto mb-4">
                    <LuUsers className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    Join Room
                  </div>
                  <div className="text-gray-600">
                    Enter a room code to join an existing file sharing session
                  </div>
                </div>
                <div className="text-center pt-4">
                  <button
                    onClick={() => setActiveTab("join")}
                    className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer  text-white font-semibold py-3 rounded-lg"
                    size="lg"
                  >
                    Join Existing Room
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "create" && <CreateRoom userDetails={userDetails} />}
        {activeTab === "join" && <JoinRoom userDetails={userDetails} />}
      </div>
    </div>
  );
};

export default Home;

{
  /* Features Section */
}
{
  /* <div className="mt-16 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-8">Why Choose ShareIt?</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Share2 className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Easy Sharing</h3>
                  <p className="text-gray-600 text-sm">Share files with anyone using a simple 9-digit room code</p>
                </div>
                <div className="p-6">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Real-time Collaboration</h3>
                  <p className="text-gray-600 text-sm">Multiple users can join the same room and share files instantly</p>
                </div>
                <div className="p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Download className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Quick Access</h3>
                  <p className="text-gray-600 text-sm">No registration required - start sharing files immediately</p>
                </div>
              </div>
            </div> */
}
