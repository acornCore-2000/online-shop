import { Link, useLocation } from "react-router-dom";
import style from "./Header.module.css";
import { FaShopify } from "react-icons/fa";
import { useAuth } from "../context/useAuth";
import protectedApi from "../api/protectedApi.ts";
import { useQueryClient } from "@tanstack/react-query";
import LoadingState from "./LoadingState";
import { getErrorMessage } from "../lib/getErrorMessage";
import { useState } from "react";

export default function Header() {
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient= useQueryClient();
  const location = useLocation();
  const [logoutError, setLogoutError] = useState("");

  if (isLoading) {
    return <LoadingState label="Loading your account" />;
  }

  const handleLogout = async () => {
    try {
      setLogoutError("");
      await protectedApi.post("/api/logout");
      await queryClient.invalidateQueries({
        queryKey:["currentUser"]
      })
    } catch (error) {
      setLogoutError(getErrorMessage(error, "Could not log out. Please try again."));
    }
  };
  return (
    <div className={style.header}>
      {logoutError && <p className={style.header__error}>{logoutError}</p>}
      <ul className={style.header__menu}>
        {location.pathname !== "/" && (
          <li className={style.header__menuItem}>
            <Link to="/">Home</Link>
          </li>
        )}

        {isAuthenticated ? (
          <>
            <li className={style.header__menuItem}>
              <button
                type="button"
                className={style.header__logoutbutton}
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>
            <li className={style.header__menuItem}>
              <Link to="/profile">Profile</Link>
            </li>
          </>
        ) : (
          <>
            <li className={style.header__menuItem}>
              <Link to="/sign-up">Sign Up</Link>
            </li>
            <li className={style.header__menuItem}>
              <Link to="/login">Login</Link>
            </li>
          </>
        )}

        <li className={style.header__menuItem}>
          <Link to="/cart">Cart </Link>
        </li>
        <li className={style.header__menuItem}>
          <Link to="/orders">Orders</Link>
        </li>
      </ul>
      <Link to="/" className={style.header__logo} aria-label="Online Shop home">
        <span className={style.header__logoMark}>
          <FaShopify size={28} />
        </span>
        <span className={style.header__logoText}>Online Shop</span>
      </Link>
    </div>
  );
}
