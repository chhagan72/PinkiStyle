// src/components/BuyNowModal.jsx
import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

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

function priceAfterDiscount(price, discountPercent) {
  const p = Number(price) || 0;
  const d = Number(discountPercent) || 0;
  return Math.max(0, p - (p * d) / 100);
}

export default function BuyNowModal({ show, onClose, product, size, onOrderComplete }) {
  const { cart, userId, clearCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    name: "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
    mobile: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");
  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState(""); // ✅ success message

  useEffect(() => {
    if (!show) return;
    (async () => {
      try {
        const { data } = await api.get("/api/me");
        if (data?.user) {
          setAddress((prev) => ({
            ...prev,
            name: data.user.name || prev.name,
            mobile: data.user.mobile || prev.mobile,
            line1: data.user.address || prev.line1,
          }));
        }
      } catch (e) {}
    })();
  }, [show]);

  if (!show) return null;

  let items = [];
  if (product && size) {
    const finalPrice = priceAfterDiscount(size.price, product.discountPercent || 0);
    items = [
      {
        productId: product._id,
        title: product.title,
        size: { ...size, price: finalPrice },
        quantity: 1,
      },
    ];
  } else {
    items = cart
      .filter((c) => !userId || c.userId === userId)
      .map((c) => {
        const finalPrice = priceAfterDiscount(c.price, c.discountPercent || 0);
        return {
          productId: c._id,
          title: c.title,
          size: { ...c.size, price: finalPrice },
          quantity: c.qty,
        };
      });
  }

  const totalAmount = items.reduce(
    (acc, it) => acc + (Number(it.size?.price || 0) * (it.quantity || 1)),
    0
  );

  const handleOrderSuccess = (order) => {
    onOrderComplete?.(order);
    clearCart();
    onClose();
    setSuccessMessage(`Order placed successfully! Order ID: ${order._id}`);

    // Redirect after 1 second
    setTimeout(() => {
      navigate("/my-orders");
    }, 1000);
  };

  const handleCreateOrder = async () => {
    if (!items.length) {
      alert("No items to order!");
      return;
    }

    if (
      !address.name.trim() ||
      !address.mobile.trim() ||
      !address.line1.trim() ||
      !address.city.trim() ||
      !address.state.trim() ||
      !address.pincode.trim()
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      if (paymentMethod === "COD") {
        const res = await api.post("/api/orders/create", {
          items,
          address,
          paymentMethod: "COD",
        });

        if (res.data.ok) {
          handleOrderSuccess(res.data.order); // ✅ use handler
        } else {
          throw new Error(res.data.error || "COD order failed");
        }
        return;
      }

      const res = await api.post("/api/orders/create", {
        items,
        address,
        paymentMethod: "RAZORPAY",
      });

      if (!res.data.ok) throw new Error(res.data.error || "Create order failed");

      const { razorpayOrderId, orderId, amount, keyId } = res.data;
      await loadRazorpayScript();

      const options = {
        key: keyId,
        amount: amount,
        currency: "INR",
        name: "PinkiStyle",
        description: product ? product.title : "Cart Checkout",
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            const verifyRes = await api.post("/api/orders/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderId,
            });
            if (verifyRes.data.ok) {
              handleOrderSuccess(verifyRes.data.order); // ✅ use handler
            } else {
              alert("Payment verification failed");
            }
          } catch (e) {
            console.error(e);
            alert("Verification error");
          } finally {
            onClose();
          }
        },
        prefill: { contact: address.mobile || "", name: address.name || "" },
        theme: { color: "#0d6efd" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert(err.message || "Order creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {product ? `Buy Now — ${product.title}` : "Checkout — Cart"}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {successMessage && (
              <div className="alert alert-success text-center">{successMessage}</div>
            )}

            {!successMessage && (
              <>
                {product && size ? (
                  <div className="mb-2">
                    <strong>Size:</strong> {size.label} •{" "}
                    <strong>Price:</strong> ₹
                    {priceAfterDiscount(size.price, product.discountPercent || 0).toFixed(2)}
                  </div>
                ) : (
                  <div className="mb-2">
                    <strong>Items:</strong> {items.length} • <strong>Total:</strong> ₹
                    {totalAmount.toFixed(2)}
                  </div>
                )}

                <div className="mb-2">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={address.name}
                    onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label">Mobile</label>
                  <input
                    type="text"
                    className="form-control"
                    value={address.mobile}
                    onChange={(e) => setAddress({ ...address, mobile: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-control"
                    value={address.line1}
                    onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                    required
                  />
                </div>

                <div className="row">
                  <div className="col">
                    <input
                      className="form-control"
                      placeholder="City"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col">
                    <input
                      className="form-control"
                      placeholder="State"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col">
                    <input
                      className="form-control"
                      placeholder="Pincode"
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <hr />

                <div>
                  <label className="form-label">Payment Method</label>
                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      className={`btn ${
                        paymentMethod === "RAZORPAY" ? "btn-primary" : "btn-outline-primary"
                      }`}
                      onClick={() => setPaymentMethod("RAZORPAY")}
                    >
                      Pay Online
                    </button>
                    <button
                      className={`btn ${
                        paymentMethod === "COD" ? "btn-primary" : "btn-outline-primary"
                      }`}
                      onClick={() => setPaymentMethod("COD")}
                    >
                      Cash on Delivery
                    </button>
                  </div>
                </div>

                <hr />

                <div>
                  <strong>Estimated Delivery:</strong>{" "}
                  {product?.deliveryDays ||
                    parseInt(process.env.REACT_APP_DEFAULT_SHIPPING_DAYS || 5)}{" "}
                  days
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            {!successMessage && (
              <>
                <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
                  Cancel
                </button>
                <button
                  className="btn btn-success"
                  onClick={handleCreateOrder}
                  disabled={loading}
                >
                  {loading
                    ? "Processing..."
                    : paymentMethod === "COD"
                    ? "Place COD Order"
                    : "Pay Now"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
