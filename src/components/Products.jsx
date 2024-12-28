import React from "react";

import products from "../data/data";
import "../styles/Products.css";

//Crear componente de productos
const Products = ({imagen, nombre, precio, descripcion}) => {
  return (
      <section className="products">
        <img src={imagen} alt="{nombre}" />
        <div className="product-info">
          <h3>{nombre}</h3>
          <p>C${precio}</p>
          <p>{descripcion}</p>
        </div>
      </section>
  );
};
export default Products;
