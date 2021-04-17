import React, { useContext } from "react";
import { AuthContext } from "./context/context";
import jwt_decode from "jwt-decode";

export default function Layout() {
  const context = useContext(AuthContext);
  const token_data = jwt_decode(context.token);
  const { name } = token_data;
  const logoutUser = (e) => {
    localStorage.removeItem("token");
    window.location.reload();
  };
  return (
    <div className="flex justify-between bg-gray-300">
      <div className="mx-auto">
        <img
          className="mx-auto h-10 w-auto px-2"
          src="/images/logo.svg"
          alt="Workflow"
        />
        <p className="capitalize font-bold text-purple-500 italic">
          Let's play {name}
        </p>
      </div>

      <div className="my-4">
        <button
          className="text-sm font-medium bg-gray-700 text-white group-hover:text-gray-700 px-2 py-2"
          onClick={logoutUser}
        >
          LOGOUT
        </button>
      </div>
    </div>
  );
}
