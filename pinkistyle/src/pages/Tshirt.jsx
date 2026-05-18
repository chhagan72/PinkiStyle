import React, { useEffect, useState } from "react";
import api from "../lib/api";
import ProductGrid from "../components/ProductGrid";

export default function Tshirt() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api.get("/api/products?category=Tshirt").then(({ data }) => setItems(data)).catch(console.error);
  }, []);
  return (
    <div className="container">
      <h2 className="my-3">Tshirt</h2>
      <ProductGrid products={items} />
    </div>
  );
}
