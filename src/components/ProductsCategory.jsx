// src/components/ProductCategory.jsx
import React from "react";
import Products from "./Products";
import products from "../data/data";

const ProductCategory = ({ categoria }) => {
  let categoriaProductos = [];
 
  if (categoria === "TODOS") {
    // Recorre todas las categorías en el objeto `products` y combina los productos
    Object.values(products).forEach((category) => {
      categoriaProductos = [...categoriaProductos, ...category];
    });
  } else {
    // Si no es "TODOS", selecciona solo la categoría específica
    categoriaProductos = products[categoria] || [];
  }
 
  
  return (
    <div className="category-section">
      <div className="product-list">
        {categoriaProductos.map((product) => (
          <Products
            key={product.id}
            nombre={product.name}
            precio={product.price}
            descripcion={product.description}
            imagen={product.image}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductCategory;
