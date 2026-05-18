import React, { useEffect, useState } from "react";
import api from "../lib/api";
import ProductGrid from "../components/ProductGrid";

export default function Man() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api.get("/api/products?category=Man").then(({ data }) => setItems(data)).catch(console.error);
  }, []);
  return (
    <div className="container">
      <h2 className="my-3">Man</h2>
      <ProductGrid products={items} />
    </div>
  );
}
