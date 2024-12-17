import React, { useContext, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { SidebarContext } from "../context/SidebarContext";
import {
  SearchIcon,
  MoonIcon,
  SunIcon,
  // BellIcon,
  MenuIcon,
  // OutlinePersonIcon,
  // OutlineCogIcon,
  OutlineLogoutIcon,
} from "../icons";
import {
  // Badge,
  Input,
  Dropdown,
  DropdownItem,
  WindmillContext,
  Button,
} from "@windmill/react-ui";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert2

function Header() {
  const history = useHistory();
  const { mode, toggleMode } = useContext(WindmillContext);
  const { toggleSidebar } = useContext(SidebarContext);

  // const [isNotificationsMenuOpen, setIsNotificationsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Check if logged in
  const [user, setUser] = useState(null); // User data, including avatar

  useEffect(() => {
    // Retrieve token from localStorage if available
    const token = localStorage.getItem("access_token");

    if (token) {
      // Fetch user data after login
      axios
        .get("http://localhost:8000/api/users", {
          headers: {
            Authorization: `Bearer ${token}`, // Use token for authorization
          },
        })
        .then((response) => {
          setUser(response.data); // Store user data in state
          setIsLoggedIn(true); // Mark as logged in
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          setIsLoggedIn(false); // If error occurs, mark as logged out
        });
    } else {
      setIsLoggedIn(false); // No token, so mark as logged out
    }
  }, [localStorage.getItem("access_token")]); // Watch for token change

  // function handleNotificationsClick() {
  //   setIsNotificationsMenuOpen(!isNotificationsMenuOpen);
  // }

  function handleProfileClick() {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  }

  function Login() {
    history.push("/Login"); // Route to login page
  }

  function handleLogout() {
    // SweetAlert2 confirmation for logout
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out from your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, log me out!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        // Proceed with logout if confirmed
        localStorage.removeItem("access_token");
        localStorage.removeItem("role");
        setIsLoggedIn(false);
        setUser(null);
        history.push("/Login");
        Swal.fire("Logged out!", "You have been logged out.", "success");
      }
    });
  }

  return (
    <header className="z-40 py-4 bg-white shadow-bottom dark:bg-gray-800">
      <div className="container flex items-center justify-between h-full px-6 mx-auto text-purple-600 dark:text-purple-300">
        {/* <!-- Mobile hamburger --> */}
        <button
          className="p-1 mr-5 -ml-1 rounded-md lg:hidden focus:outline-none focus:shadow-outline-purple"
          onClick={toggleSidebar}
          aria-label="Menu"
        >
          <MenuIcon className="w-6 h-6" aria-hidden="true" />
        </button>

        {/* <!-- Search input --> */}
        <div className="flex justify-center flex-1 lg:mr-32">
          <div className="relative w-full max-w-xl mr-6 focus-within:text-purple-500">
            <div className="absolute inset-y-0 flex items-center pl-2">
              <SearchIcon className="w-4 h-4" aria-hidden="true" />
            </div>
            <Input
              className="pl-8 text-gray-700"
              placeholder="Cari"
              aria-label="Search"
            />
          </div>
        </div>

        <ul className="flex items-center flex-shrink-0 space-x-6">
          {/* <!-- Theme toggler --> */}
          <li className="flex">
            <button
              className="rounded-md focus:outline-none focus:shadow-outline-purple"
              onClick={toggleMode}
              aria-label="Toggle color mode"
            >
              {mode === "dark" ? (
                <SunIcon className="w-5 h-5" aria-hidden="true" />
              ) : (
                <MoonIcon className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </li>

          {/* <!-- Notifications menu -->
          <li className="relative">
            <button
              className="relative align-middle rounded-md focus:outline-none focus:shadow-outline-purple"
              onClick={handleNotificationsClick}
              aria-label="Notifications"
              aria-haspopup="true"
            >
              <BellIcon className="w-5 h-5" aria-hidden="true" />
              <span
                aria-hidden="true"
                className="absolute top-0 right-0 inline-block w-3 h-3 transform translate-x-1 -translate-y-1 bg-red-600 border-2 border-white rounded-full dark:border-gray-800"
              ></span>
            </button>

            <Dropdown
              align="right"
              isOpen={isNotificationsMenuOpen}
              onClose={() => setIsNotificationsMenuOpen(false)}
            >
              <DropdownItem tag="a" href="#" className="justify-between">
                <span>Messages</span>
                <Badge type="danger">13</Badge>
              </DropdownItem>
              <DropdownItem tag="a" href="#" className="justify-between">
                <span>Sales</span>
                <Badge type="danger">2</Badge>
              </DropdownItem>
              <DropdownItem onClick={() => alert("Alerts!")}>
                <span>Alerts</span>
              </DropdownItem>
            </Dropdown>
          </li> */}

          <li className="relative">
            {isLoggedIn && user ? (
              <button
                onClick={handleProfileClick}
                className="relative align-middle rounded-full focus:outline-none focus:shadow-outline-purple"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  {user.foto && (
                    <img
                      src={`http://localhost:8000/storage/${user.foto}`}
                      alt="User Profile"
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
              </button>
            ) : (
              <Button onClick={Login}>Login</Button>
            )}
            <Dropdown
              align="right"
              isOpen={isProfileMenuOpen}
              onClose={() => setIsProfileMenuOpen(false)}
            >
              <DropdownItem onClick={handleLogout}>
                <OutlineLogoutIcon
                  className="w-4 h-4 mr-3"
                  aria-hidden="true"
                />
                <span>Log out</span>
              </DropdownItem>
            </Dropdown>
          </li>
        </ul>
      </div>
    </header>
  );
}

export default Header;
