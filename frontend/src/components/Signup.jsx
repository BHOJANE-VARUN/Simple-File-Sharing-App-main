import React, { useState } from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../util/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { COMPANY_NAME } from "../util/Constants";

function isStrongPassword(pw) {
  return (
    pw.length >= 8 &&
    /[A-Z]/.test(pw) &&
    /[a-z]/.test(pw) &&
    /[0-9]/.test(pw) &&
    /[^A-Za-z0-9]/.test(pw)
  );
}

function Header() {
  return (
    <header className="p-4 flex justify-start items-center w-full border-gray-300">
      <Logo size={"80"} />
      <h1 className="text-4xl font-semibold">{COMPANY_NAME}</h1>
    </header>
  );
}

function Signup() {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    const { name, email, password } = formData;

    if (!name.trim()) newErrors.name = "Username cannot be empty.";
    else if (name.length > 20)
      newErrors.name = "Username too long (max 20 characters).";
    else if (!/^[a-zA-Z0-9]+$/.test(name))
      newErrors.name = "Username must be alphanumeric.";

    if (!email.includes("@")) newErrors.email = "Invalid email format.";

    if (!isStrongPassword(password)) {
      newErrors.password =
        "Password must be 8+ characters, include uppercase, lowercase, number, and symbol.";
    }

    return newErrors;
  };

  const checkValidData = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    } else {
      // call Firebase/signup logic here
      return true;
    }
  };

  const handleSubmit = (e) => {
    const message = checkValidData(e);
    if (!message) return;
    const { name, email, password } = formData;
    if (!isLogin) {
      // Sign Up Logic
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          updateProfile(user, {
            displayName: name,
          }).catch((error) => {
            alert(error.message);
          });
          navigate("/home");
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          alert(errorCode + "-" + errorMessage);
        });
    } else {
      // Sign In Logic
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          navigate("/home");
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          alert(errorCode + "-" + errorMessage);
        });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/home");
      } else {
        navigate("/");
      }
    });

    // Unsiubscribe when component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-[#e1e2e2] flex flex-col items-center min-h-screen">
      <Header />
      <div className="bg-white border-2 border-gray-300 m-2 md:m-10 mt-24 p-10 rounded-2xl shadow-xl w-[60%] md:w-[50%] lg:w-[400px] mx-auto space-y-10">
        <span
          className="flex self-start cursor-pointer items-center space-x-2"
          onClick={() => setIsLogin(!isLogin)}
        >
          <IoArrowBackOutline size={"30px"} />
          <p className="text-xl text-gray-800 underline">
            {!isLogin ? "Login" : "Signup"}
          </p>
        </span>

        {isLogin ? (
          <div className="flex flex-col w-full">
            <h2 className="text-2xl font-semibold mb-4 text-center">Login</h2>
            <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
              <div>
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`border p-2 rounded w-full ${
                    errors.email ? "border-red-500" : ""
                  }`}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`border p-2 rounded w-full ${
                    errors.password ? "border-red-500" : ""
                  }`}
                />
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                className="bg-[#0061fe] text-white px-4 py-2 rounded-lg font-semibold text-lg hover:bg-[#003bfe]"
              >
                Login
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col w-full">
            <h2 className="text-2xl font-semibold mb-4 text-center">Sign Up</h2>
            <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
              <div>
                <input
                  name="name"
                  type="text"
                  placeholder="Username"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`border p-2 rounded w-full ${
                    errors.name ? "border-red-500" : ""
                  }`}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`border p-2 rounded w-full ${
                    errors.email ? "border-red-500" : ""
                  }`}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`border p-2 rounded w-full ${
                    errors.password ? "border-red-500" : ""
                  }`}
                />
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                className="bg-[#0061fe] text-white px-4 py-2 rounded-lg font-semibold text-lg hover:bg-[#003bfe]"
              >
                Sign Up
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Signup;
