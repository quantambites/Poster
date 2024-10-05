import React from "react";
import { Link, useMatch, useResolvedPath } from "react-router-dom"
import "./sidebar.css"; // Import your sidebar styles
import { Home,User,Code,PenLine  } from "lucide-react"
import { useState, useEffect, useRef } from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");

export default function Sidebar({ isOpen, closeSidebar }) {
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        closeSidebar();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeSidebar]);


  useEffect(() => {
    // Toggle the blurred background class on the main content area when the sidebar is open
    const mainContent = document.querySelector(".main-content");
    if (mainContent) {
      if (isOpen) {
        mainContent.classList.add("blurred-background");
      } else {
        // Add a slight delay before removing the blurred background class
        setTimeout(() => {
          mainContent.classList.remove("blurred-background");
        }, 400); // Adjust the delay to match the transition duration
      }
    }
  }, [isOpen]);

 
  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}  ref={sidebarRef}>
      <ul>
        <li>
        <CustomLink to="/profile" onClick={closeSidebar} className="comp">
        <User /> <span className="icon-text">Profile</span></CustomLink> 
        <CustomLink to="/" onClick={closeSidebar} className="comp">
        <Home /> <span className="icon-text">Home</span></CustomLink>
        <CustomLink to="/custom" onClick={closeSidebar} className="comp">
        <PenLine /> <span className="icon-text">Custom</span>  </CustomLink>
        <CustomLink to="/developer" onClick={closeSidebar} className="comp">
        <Code /> <span className="icon-text">Developer</span> </CustomLink>
          
         
        </li>
      </ul>

      
    </div>
  );
}

function CustomLink({ to, children, ...props }) {
    const resolvedPath = useResolvedPath(to)
    const isActive = useMatch({ path: resolvedPath.pathname, end: true })
  
    return (
      <li className={isActive ? "active" : ""}>
        <Link to={to} {...props}>
          {children}
        </Link>
      </li>
    )
  }


 