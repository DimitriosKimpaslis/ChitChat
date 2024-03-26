import { useContext, useState } from "react";
import { io } from "socket.io-client";
import { useLocation, useNavigate } from "react-router-dom";
import { SocketContext } from "../Top";
import logo from "../../assets/logo.png";
import { HttpEndpoint } from "../Top";
import { HttpsEndpoint } from "../Top";


const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState({
    username: "",
    password: "",
    overall: "",
  });
  const { setSocket } = useContext(SocketContext);

  const { HTTPSendpoint } = useContext(HttpsEndpoint);
  const { HTTPendpoint } = useContext(HttpEndpoint);

  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const registrationSuccess = query.get("registrationSuccess");


  const handleUsernameChange = (e) => {
    setError({ ...error, username: "" });
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setError({ ...error, password: "" });
    setPassword(e.target.value);
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({ ...error, overall: "" });
    if (username === "") {
      setError({ ...error, username: "Username is required" });
      return;
    }
    if (username.length < 3 || username.length > 20) {
      setError({
        ...error,
        username: "Username must be between 3 and 20 characters",
      });
      return;
    }
    if (password === "") {
      setError({ ...error, password: "Password is required" });
      return;
    }

    if (password.length < 4 || password.length > 20) {
      setError({
        ...error,
        password: "Password must be between 4 and 20 characters",
      });
      return;
    }
    console.log("Logging in...");
    try {
      const res = await fetch("http://messagingclientchitchat.gr/api/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (res.status === 200) {
        console.log("Logged in successfully");
        testSocketConnection();
      } else {
        console.log("Failed to log in");
        setError({ ...error, overall: "Incorrect login credentials" });
      }
    } catch (error) {
      console.error("Failed to log in", error);
    }
  };

  const testSocketConnection = async () => {
    console.log("Testing socket connection");
    try {
      const socket = io("http://messagingclientchitchat.gr/", {
        autoConnect: false,
        withCredentials: true,
      });
      setSocket(socket);
      socket.connect();
      navigate("/messaging");
    } catch (error) {
      console.error("Failed to connect to socket");
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a
          href="#"
          className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
        >
          <img
            className="w-8 h-8 mr-2"
            src={logo}
            alt="logo"
          />
          ChitChat
        </a>
        {registrationSuccess && (
          <p className="text-green-500 mb-4">
            Registration successful! You can now log in
          </p>
        )}
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Sign in to your account
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your Username
                </label>
                <input
                  type="text"
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Dimitrios Kimpaslis"
                  required=""
                  value={username}
                  onChange={(e) => handleUsernameChange(e)}
                />
                <p className="text-red-500 text-xs italic">{error.username}</p>
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required=""
                  value={password}
                  onChange={(e) => handlePasswordChange(e)}
                />
                <p className="text-red-500 text-xs italic">{error.password}</p>
              </div>
              <button
                type="submit"
                className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 "
              >
                Sign in
              </button>
              <p className="text-red-500 text-xs italic">{error.overall}</p>

              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Don’t have an account yet?{" "}
                <a
                  onClick={() => navigate("/auth/register")}
                  className="font-medium text-blue-600 hover:underline dark:text-blue-500 cursor-pointer"
                >
                  Sign up
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
