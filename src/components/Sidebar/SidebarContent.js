import React, { useEffect, useState } from "react";
import routes from "../../routes/sidebar";
import { NavLink, Route } from "react-router-dom";
import * as Icons from "../../icons";
import SidebarSubmenu from "./SidebarSubmenu";
import { Link } from "react-router-dom";

function Icon({ icon, ...props }) {
  const Icon = Icons[icon];
  return <Icon {...props} />;
}

function SidebarContent() {
  const [role, setRole] = useState("");

  useEffect(() => {
    // Ambil role dari localStorage saat komponen dimuat
    const userRole = localStorage.getItem("role");
    setRole(userRole);
  }, []);

  // Filter rute berdasarkan role pengguna
  const filteredRoutes = routes.filter((route) => {
    return route.role === "all" || route.role === role;
  });

  return (
    <div className="py-5 text-gray-500 dark:text-gray-500">
      <Link
        className="ml-8 text-lg font-bold text-gray-800 dark:text-gray-200"
        to="/app/dashboard"
        style={{ textAlign: "center" }}
      >
        <img
          src={`${process.env.PUBLIC_URL}/logo192.png`}
          alt="Logo"
          width="75"
          height="75"
          style={{ display: "block", margin: "0 auto" }}
        />
      </Link>

      <ul className="mt-6">
        {filteredRoutes.map((route) =>
          route.routes ? (
            <SidebarSubmenu route={route} key={route.name} />
          ) : (
            <li className="relative px-6 py-3" key={route.name}>
              <NavLink
                exact
                to={route.path}
                className="inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200"
                activeClassName="text-gray-800 dark:text-gray-100"
              >
                <Route path={route.path} exact={route.exact}>
                  <span
                    className="absolute inset-y-0 left-0 w-1 bg-purple-600 rounded-tr-lg rounded-br-lg"
                    aria-hidden="true"
                  ></span>
                </Route>
                <Icon
                  className="w-5 h-5"
                  aria-hidden="true"
                  icon={route.icon}
                />
                <span className="ml-4">{route.name}</span>
              </NavLink>
            </li>
          )
        )}
      </ul>
    </div>
  );
}

export default SidebarContent;
