import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import ReviewModal from "../components/ReviewModal";
import { useNavigate } from "react-router-dom";
import BuyNowModal from "../components/BuyNowModal";

function priceAfterDiscount(price, discountPercent) {
  const p = Number(price) || 0;
  const d = Number(discountPercent) || 0;
  return Math.max(0, p - (p * d) / 100).toFixed(2);
}

export default function CartPage() {
  const { cart, removeFromCart, clearCart, updateQty, userId } = useCart();
  const navigate = useNavigate();

  const [showReview, setShowReview] = useState(false);
  const [reviewProductId, setReviewProductId] = useState(null);

  // ✅ BuyNow states
  const [showBuy, setShowBuy] = useState(false);
  const [product, setProduct] = useState(null);
  const [s, setS] = useState(null);

  // ✅ filter by user
  const userCart = userId ? cart.filter((item) => item.userId === userId) : [];

  if (!userCart.length) {
    return (
      <div className="p-5 text-center">
        <h4>🛒 Your cart is empty</h4>
        <button
          className="btn btn-primary mt-3"
          onClick={() => navigate("/Home")}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  // Totals
  const { originalTotal, discountedTotal } = userCart.reduce(
    (acc, item) => {
      const finalPrice = Number(
        priceAfterDiscount(item.price, item.discountPercent || 0)
      );
      acc.originalTotal += item.price * item.qty;
      acc.discountedTotal += finalPrice * item.qty;
      return acc;
    },
    { originalTotal: 0, discountedTotal: 0 }
  );

  const savings = originalTotal - discountedTotal;
  const shipping = discountedTotal > 1000 ? 0 : 0;
  const tax = (discountedTotal * 0.0).toFixed(2);
  const finalPayable = discountedTotal + shipping + Number(tax);

  return (
    <div className="container py-4">
      <h3 className="mb-4">🛒 Shopping Cart</h3>

      <div className="row">
        {/* Cart Items */}
        <div className="col-lg-8">
          {userCart.map((item, idx) => {
            const finalPrice = Number(
              priceAfterDiscount(item.price, item.discountPercent || 0)
            );
            return (
              <div key={idx} className="card shadow-sm mb-3 border-0 rounded-3">
                <div className="row g-0 align-items-center">
                  <div className="col-md-4">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="img-fluid rounded-start"
                        style={{
                          height: "200px",
                          width: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                  </div>
                  <div className="col-md-8">
                    <div className="card-body">
                      <h5 className="card-title">{item.title}</h5>
                      <p className="mb-1">
                        Size: <strong>{item.size?.label || "N/A"}</strong>
                      </p>
                      <div className="d-flex align-items-center mb-2">
                        <label className="me-2">Qty:</label>
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) =>
                            updateQty(
                              item._id,
                              item.size?.label,
                              parseInt(e.target.value) || 1
                            )
                          }
                          style={{ width: "80px" }}
                          className="form-control form-control-sm"
                        />
                      </div>

                      <h6 className="text-success fw-bold">
                        ₹ {(finalPrice * item.qty).toFixed(2)}
                      </h6>
                      {item.discountPercent > 0 && (
                        <small className="text-muted text-decoration-line-through">
                          ₹ {(item.price * item.qty).toFixed(2)}
                        </small>
                      )}
                        {/* ✅ Delivery Days */}
                      <p className="text-muted mb-1 mt-3">
                        🚚 Delivery in{" "}
                        <strong>{item.deliveryDays} days</strong>
                      </p>


                      <div className="mt-3 d-flex flex-wrap gap-2">
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() =>
                            removeFromCart(item._id, item.size?.label)
                          }
                        >
                          ❌ Remove
                        </button>
                        {/* <button
                          className="btn btn-sm btn-success"
                          onClick={() => {
                            setProduct(item);
                            setS(item.size?.label);
                            setShowBuy(true);
                          }}
                        >
                          ⚡ Buy Now
                        </button> */}
                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => navigate(`/product/${item._id}`)}
                        >
                          🔍 Details
                        </button>
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => {
                            setReviewProductId(item._id);
                            setShowReview(true);
                          }}
                        >
                          ⭐ Review
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="col-lg-4">
          <div
            className="card shadow-sm border-0 rounded-3 p-3 sticky-top"
            style={{ top: "80px", zIndex: 10 }}
          >
            <h5 className="mb-3">🧾 Order Summary</h5>
            <div className="d-flex justify-content-between mb-1">
              <span>Subtotal:</span>
              <span>₹{discountedTotal.toFixed(2)}</span>
            </div>
            {savings > 0 && (
              <div className="d-flex justify-content-between text-success mb-1">
                <span>You Saved:</span>
                <span>-₹{savings.toFixed(2)}</span>
              </div>
            )}
            <div className="d-flex justify-content-between mb-1">
              <span>Shipping:</span>
              <span>
                {shipping === 0 ? (
                  <span className="text-success">FREE</span>
                ) : (
                  `₹${shipping}`
                )}
              </span>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span>Tax (0%):</span>
              <span>₹{tax}</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between fw-bold">
              <span>Total Payable:</span>
              <span className="text-primary">₹{finalPayable.toFixed(2)}</span>
            </div>

            <button
              className="btn btn-success w-100 mt-3"
              onClick={() => {
                setProduct(null); // For full cart checkout
                setS(null);
                setShowBuy(true);
              }}
            >
              ✅ Place Order
            </button>
            <button
              className="btn btn-outline-danger w-100 mt-2"
              onClick={clearCart}
            >
              🗑️ Clear Cart
            </button>
          </div>
        </div>
      </div>

      <ReviewModal
        show={showReview}
        onClose={() => setShowReview(false)}
        productId={reviewProductId}
        onReviewAdded={() => window.location.reload()}
      />
      <BuyNowModal
        show={showBuy}
        onClose={() => setShowBuy(false)}
        product={product}
        size={s}
        onOrderComplete={(order) => {
          alert("Order placed! Order id: " + order._id);
          // ✅ Auto remove from cart after order placed
          if (product) {
            removeFromCart(product._id, s);
          } else {
            clearCart();
          }
        }}
      />
    </div>
  );
}
