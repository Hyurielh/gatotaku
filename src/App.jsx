import { useState } from "react";
import ProductsCategory from "./components/ProductsCategory";
import "./App.css";

const images = import.meta.glob('./assets/img/**/*.{jpg,png}');


function App() {
  const [selectCategory, setSelectCategory] = useState("TODOS");

  const handleCategoryChange = (category) => {
    selectCategory === category ? setSelectCategory("TODOS") : setSelectCategory(category);
  };

  return (
    <>     
      <h1 className="title">Gatotaku</h1>
      <div className="category-buttons">
        <button onClick={() => handleCategoryChange("TODOS")}>Todos</button>
        <button onClick={() => handleCategoryChange("COLLARES")}>Collares</button>
        <button onClick={() => handleCategoryChange("PELUCHES")}>Peluches</button>
        <button onClick={() => handleCategoryChange("FIGURAS")}>Figuras</button>
      </div>

      <ProductsCategory categoria={selectCategory} />
    </>
  );
}

export default App;
