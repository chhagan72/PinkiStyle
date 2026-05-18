// src/pages/OrderDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";

function loadRazorpayScript(src = "https://checkout.razorpay.com/v1/checkout.js") {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Razorpay SDK failed to load"));
    document.body.appendChild(script);
  });
}

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // cancel modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("Changed my mind");
  const [cancelComment, setCancelComment] = useState("");
  const [otherReasonText, setOtherReasonText] = useState("");

  // repayment fields
  const [upiId, setUpiId] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");

  const cancelReasons = [
    "Changed my mind",
    "Found cheaper elsewhere",
    "Ordered by mistake",
    "Delivery time too long",
    "Other",
  ];

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/api/orders/${id}`);
        if (res.data.ok || res.data.success) {
          setOrder(res.data.order);
        } else {
          console.error("Order fetch failed:", res.data);
        }
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handlePayNow = async () => {
    try {
      const res = await api.post(`/api/orders/pay/${order._id}`);
      if (!res.data.ok && !res.data.success) {
        alert(res.data.error || "Unable to start payment");
        return;
      }

      const { razorpayOrderId, orderId, amount, keyId } = res.data;
      await loadRazorpayScript();

      const options = {
        key: keyId,
        amount,
        currency: "INR",
        name: "PinkiStyle",
        description: `Order ${orderId}`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          const verifyRes = await api.post("/api/orders/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId,
          });
          if (verifyRes.data.ok || verifyRes.data.success) {
            setOrder(verifyRes.data.order);
            alert("Payment successful!");
          } else {
            alert("Payment verification failed");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment error");
    }
  };

  const handleCancelOrder = async () => {
    try {
      const reason =
        cancelReason === "Other" ? otherReasonText || "Other reason" : cancelReason;

      const res = await api.post(`/api/orders/cancel/${order._id}`, {
        reason,
        comment: cancelComment,
        repayment: order.status === "paid"
          ? {
              upiId,
              bankName,
              accountNumber,
              ifsc,
            }
          : undefined,
      });

      if (res.data.ok || res.data.success) {
        setOrder(res.data.order);
        setShowCancelModal(false);
        alert("Order cancelled successfully");
      } else {
        alert(res.data.error || "Cancellation failed");
      }
    } catch (err) {
      console.error("Cancel error:", err);
      alert("Error cancelling order");
    }
  };

  if (loading)
    return (
      <div className="p-5 text-center fs-5 fw-semibold">
        ⏳ Loading order details...
      </div>
    );

  if (!order)
    return (
      <div className="p-5 text-center fs-5 fw-semibold">
        Order not found.
      </div>
    );

  const isPaid = order.status === "paid";
  const isCancelled = order.status === "cancelled";
  const isCOD = order.paymentMethod === "COD";

  return (
    <div className="container my-5">
      <button className="btn btn-outline-secondary mb-4" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h3 className="fw-bold text-gradient mb-4">
        Order #{order._id.slice(-6).toUpperCase()}
      </h3>

      <div className="order-details-card shadow-lg p-4 rounded">
        <div className="mb-4">
          <strong>Status:</strong>{" "}
          <span
            className={`badge fs-6 px-3 py-2 ${
              isPaid
                ? "bg-success"
                : order.status === "cod"
                ? "bg-warning text-dark"
                : isCancelled
                ? "bg-secondary"
                : "bg-danger"
            }`}
          >
            {order.status}
          </span>
        </div>

        <h5>🛍 Items</h5>
        <div className="order-items mb-4">
          {order.items.map((it, idx) => (
            <div key={idx} className="order-item d-flex align-items-center mb-3">
              <img
                src={it.productId?.images?.[0] || "/noimg.png"}
                alt={it.title}
                className="order-item-img"
              />
              <div className="ms-3">
                <div className="fw-semibold">{it.productId?.title || it.title}</div>
                <div className="small text-muted">Qty: {it.quantity}</div>
                <div className="fw-bold text-success">
                  ₹
                  {(
                    (it.size?.price || 0) -
                    ((it.size?.price || 0) * (it.size?.discountPercent || 0)) / 100
                  ).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <h5>📦 Delivery Details</h5>
        <div className="mb-4">
          <div>
            <strong>Address: </strong>
            {order.address?.line1}, {order.address?.city}, {order.address?.pincode}
          </div>
          <div>
            <strong>Estimated Delivery: </strong>
            {order.estimatedDeliveryDays || "N/A"} days
          </div>
        </div>

        <h5>💰 Payment</h5>
        <div>
          <strong>Total Amount:</strong> ₹{(order.amount / 100).toFixed(2)}
        </div>

        <div className="mt-4 d-flex flex-wrap gap-2">
          {/* Pay Now visible only if NOT paid or cancelled */}
          {!isPaid && !isCancelled && (
            <button className="btn btn-gradient px-4 py-2" onClick={handlePayNow}>
              💳 Pay Now
            </button>
          )}

          {/* Cancel always visible (paid, COD, etc) */}
          {!isCancelled && (
            <button
              className="btn btn-outline-danger px-4 py-2"
              onClick={() => setShowCancelModal(true)}
            >
              ❌ Cancel Order
            </button>
          )}

          <button
            className="btn btn-outline-primary px-4 py-2"
            onClick={() => alert("Tracking coming soon!")}
          >
            🚚 Track Order
          </button>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="modal d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cancel Order</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCancelModal(false)}
                />
              </div>
              <div className="modal-body">
                <label className="form-label">Reason</label>
                <select
                  className="form-control mb-2"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                >
                  {cancelReasons.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>

                {/* Show other reason input */}
                {cancelReason === "Other" && (
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Enter other reason"
                    value={otherReasonText}
                    onChange={(e) => setOtherReasonText(e.target.value)}
                  />
                )}

                <label className="form-label">Comment (optional)</label>
                <textarea
                  className="form-control mb-2"
                  value={cancelComment}
                  onChange={(e) => setCancelComment(e.target.value)}
                />

                {/* Repayment fields for paid orders only */}
                {isPaid && (
                  <>
                    <h6 className="mt-3">💵 Repayment Details</h6>
                    <label className="form-label">UPI ID</label>
                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder="yourupi@bank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                    <label className="form-label">Bank Name</label>
                    <input
                      type="text"
                      className="form-control mb-2"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                    />
                    <label className="form-label">Account Number</label>
                    <input
                      type="text"
                      className="form-control mb-2"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                    />
                    <label className="form-label">IFSC Code</label>
                    <input
                      type="text"
                      className="form-control mb-2"
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value)}
                    />
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowCancelModal(false)}>
                  Close
                </button>
                <button className="btn btn-danger" onClick={handleCancelOrder}>
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .order-item-img {
          width: 80px;
          height: 80px;
          border-radius: 10px;
          object-fit: cover;
        }
        .order-details-card {
          background: #fff;
          border-radius: 16px;
        }
        .btn-gradient {
          background: linear-gradient(90deg, #007bff, #00c6ff);
          border: none;
          color: white;
          border-radius: 12px;
        }
        .text-gradient {
          background: linear-gradient(90deg, #007bff, #00c6ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </div>
  );
}
