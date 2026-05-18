import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../utils/auth";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [userId, setUserId] = useState(null);

  // Load userId & cart from localStorage
  useEffect(() => {
    const user = auth.getUser(); // { _id, role, ... }
    if (user?._id) {
      setUserId(user._id);
      const savedCart = localStorage.getItem(`cart_${user._id}`);
      if (savedCart) setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save per-user cart
  useEffect(() => {
    if (userId) {
      localStorage.setItem(`cart_${userId}`, JSON.stringify(cart));
    }
  }, [cart, userId]);

  // ✅ Cart Count (default 0)
  const cartCount = userId
    ? cart.filter((item) => item.userId === userId).reduce((acc, item) => acc + item.qty, 0)
    : 0;

  // Add to cart
  const addToCart = (product, size) => {
    if (!userId) {
      alert("Please login first");
      return;
    }

    setCart((prev) => {
      const exists = prev.some(
        (item) =>
          item._id === product._id &&
          item.size?.label === size?.label &&
          item.userId === userId
      );
      if (exists) {
        // update qty if already exists
        return prev.map((item) =>
          item._id === product._id &&
          item.size?.label === size?.label &&
          item.userId === userId
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          ...product,
          size,
          qty: 1,
          userId,
          image: product.images?.[0]
            ? `http://localhost:5000${product.images[0]}`
            : "",
          price: size.price,
        },
      ];
    });
  };

  const removeFromCart = (id, sizeLabel) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item._id === id &&
            item.size?.label === sizeLabel &&
            item.userId === userId
          )
      )
    );
  };

  const clearCart = () => {
    setCart((prev) => prev.filter((item) => item.userId !== userId));
    localStorage.removeItem(`cart_${userId}`);
  };

  const updateQty = (id, sizeLabel, newQty) => {
    setCart((prev) =>
      prev.map((item) =>
        item._id === id &&
        item.size?.label === sizeLabel &&
        item.userId === userId
          ? { ...item, qty: Math.max(1, newQty) }
          : item
      )
    );
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount, // ✅ expose cart count
        addToCart,
        removeFromCart,
        clearCart,
        updateQty,
        userId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
