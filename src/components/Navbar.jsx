import React, { useState } from "react";
import "../style/Navbar.css";
import "../style/Logo.css";


const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
       <nav className="navbar">
            <div className="nav-logo hover">
              <img src="src\assets\logo.svg" alt="" className="logo hover" /> 
            </div>
           
           <ul className={`nav-menu ${isOpen ? "open" : ""}`}>
                <li className="nav-item"><a className="nav-link" href="">Inicio</a></li>
                <li className="nav-item"><a className="nav-link" href="">Producto</a></li>
                <li className="nav-item"><a className="nav-link" href="">Nosotros</a></li>
                <li className="nav-item"><a className="nav-link" href="">Contacto</a></li>
           </ul>
            <div className={`nav-toggle ${isOpen ? "open" : ""}`} onClick={ () => setIsOpen(!isOpen) } >
                <span></span><span></span><span></span>
            </div>
        </nav>
    );
}
export default Navbar;