// src/pages/MyOrders.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/orders/my");
        if (res.data.ok || res.data.success) {
          setOrders(res.data.orders);
        } else {
          console.error("Failed to load orders:", res.data);
        }
      } catch (err) {
        console.error("Error loading orders:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return <div className="p-4 text-center fs-5 fw-semibold">⏳ Loading your orders...</div>;

  if (!orders.length)
    return <div className="p-4 text-center fs-5 fw-semibold">No orders found.</div>;

  return (
    <div className="container my-5">
      <h2 className="mb-5 fw-bold text-center text-gradient">📦 My Orders</h2>

      <div className="orders-wrapper">
        {orders.map((order) => (
          <div
            key={order._id}
            className="order-card shadow-lg"
            onClick={() => navigate(`/order/${order._id}`)}
            style={{ cursor: "pointer" }}
          >
            <div className="order-header d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold text-primary mb-1">
                  Order #{order._id.slice(-6).toUpperCase()}
                </h5>
                <small className="text-muted">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </small>
              </div>
              <span
                className={`badge fs-6 px-3 py-2 rounded-pill shadow-sm ${
                  order.status === "paid"
                    ? "bg-success"
                    : order.status === "cod"
                    ? "bg-warning text-dark"
                    : order.status === "cancelled"
                    ? "bg-secondary"
                    : "bg-danger"
                }`}
              >
                {order.status}
              </span>
            </div>

            <div className="order-items">
              {order.items.slice(0, 2).map((it, idx) => (
                <div key={idx} className="order-item d-flex align-items-center">
                  <img
                    src={it.productId?.images?.[0] || "/noimg.png"}
                    alt={it.title}
                    className="order-item-img"
                  />
                  <div className="ms-3">
                    <div className="fw-semibold">{it.productId?.title || it.title}</div>
                    <div className="small text-muted">Qty: {it.quantity}</div>
                  </div>
                </div>
              ))}
              {order.items.length > 2 && (
                <div className="small text-muted mt-2">+{order.items.length - 2} more items</div>
              )}
            </div>

            <div className="order-footer mt-3 d-flex justify-content-between align-items-center">
              <div>
                <strong>Total: </strong>₹{(order.amount / 100).toFixed(2)}
              </div>
              <button className="btn btn-sm btn-gradient px-3 py-2">View Details →</button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .orders-wrapper { display: flex; flex-direction: column; gap: 2rem; }
        .order-card { background: #fff; border-radius: 16px; padding: 1.5rem; backdrop-filter: blur(12px); transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .order-card:hover { transform: translateY(-6px); box-shadow: 0 15px 25px rgba(0,0,0,0.15) !important; }
        .order-header { border-bottom: 1px solid #eee; padding-bottom: .5rem; }
        .order-items { margin-top: 1rem; display: flex; flex-direction: column; gap: 1rem; }
        .order-item { background: #f9f9f9; padding: .75rem; border-radius: 12px; transition: background 0.2s ease; }
        .order-item:hover { background: #eef6ff; }
        .order-item-img { width: 70px; height: 70px; border-radius: 10px; object-fit: cover; }
        .text-gradient { background: linear-gradient(90deg, #007bff, #00c6ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .btn-gradient { background: linear-gradient(90deg, #007bff, #00c6ff); border: none; color: white; border-radius: 12px; }
      `}</style>
    </div>
  );
}
