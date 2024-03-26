import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./components/App";
import Chat from "./components/chat/Chat";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import Auth from "./components/auth/Auth";
import Top from "./components/Top";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Top />}>
          <Route path="/messaging" element={<App />}>
            <Route index element={<Chat hello={true} />} />
            <Route path=":channel" element={<Chat />} />
          </Route>
          <Route path="/auth" element={<Auth />}>
            <Route path="register" element={<Register />} />
            <Route path="login" element={<Login />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
