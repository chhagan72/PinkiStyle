import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import ReviewModal from "./ReviewModal";
import BuyNowModal from "./BuyNowModal";

function priceAfterDiscount(price, discountPercent) {
  const p = Number(price) || 0;
  const d = Number(discountPercent) || 0;
  return Math.max(0, p - (p * d) / 100).toFixed(2);
}

export default function ProductGrid({ products = [] }) {
  const { cart, addToCart } = useCart();
  const navigate = useNavigate();

  // Review modal state
  const [showReview, setShowReview] = useState(false);
  const [reviewProductId, setReviewProductId] = useState(null);

  const openReview = (id) => {
    setReviewProductId(id);
    setShowReview(true);
  };

  return (
    <>
      <div className="row g-4">
        {products.map((p) => (
          <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={p._id}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="card border-0 shadow-lg rounded-4 overflow-hidden h-100"
            >
              {/* ✅ Product Image / Carousel */}
              <div className="ratio ratio-1x1 bg-light">
                {p.images?.length ? (
                  <Carousel images={p.images} id={p._id} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center text-muted">
                    No Image
                  </div>
                )}
              </div>

              {/* ✅ Card Body */}
              <div className="card-body d-flex flex-column p-3">
                {/* Title */}
                <h6 className="fw-bold text-truncate mb-2">{p.title}</h6>

                {/* Sizes + Price */}
                <SizePrice
                  product={p}
                  sizes={p.sizes || []}
                  discountPercent={p.discountPercent || 0}
                  deliveryDays={p.deliveryDays} // ✅ pass delivery days
                  addToCart={addToCart}
                  cart={cart}
                  navigate={navigate}
                />

                {/* Actions */}
                <div className="mt-3 d-flex flex-column gap-2">
                  <button
                    className="btn btn-outline-info w-100"
                    onClick={() => navigate(`/product/${p._id}`)}
                  >
                    📖 View Details
                  </button>
                  <button
                    className="btn btn-outline-warning w-100"
                    onClick={() => openReview(p._id)}
                  >
                    ⭐ Customer Reviews
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* ✅ Review Modal */}
      <ReviewModal
        show={showReview}
        onClose={() => setShowReview(false)}
        productId={reviewProductId}
        onReviewAdded={() => window.location.reload()}
      />
    </>
  );
}

/* ✅ Carousel Component */
function Carousel({ images, id }) {
  const carouselId = `carousel-${id}`;
  const carouselRef = useRef(null);
  let startX = 0;

  const handleMouseDown = (e) => {
    startX = e.clientX;
  };

  const handleMouseUp = (e) => {
    const endX = e.clientX;
    const diff = startX - endX;

    if (Math.abs(diff) > 50) {
      const carousel = window.bootstrap.Carousel.getInstance(
        carouselRef.current
      );
      if (diff > 0) carousel.next();
      else carousel.prev();
    }
  };

  return (
    <div
      id={carouselId}
      className="carousel slide h-100"
      data-bs-ride="carousel"
      ref={carouselRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className="carousel-inner h-100">
        {images.map((img, idx) => (
          <div
            key={idx}
            className={`carousel-item h-100 ${idx === 0 ? "active" : ""}`}
          >
            <img
              src={`http://localhost:5000${img}`}
              alt={`slide-${idx}`}
              className="d-block w-100 h-100"
              style={{
                objectFit: "cover",
                borderRadius: "12px",
              }}
            />
          </div>
        ))}
      </div>

      {/* Controls */}
      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target={`#${carouselId}`}
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon bg-dark rounded-circle p-2"></span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target={`#${carouselId}`}
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon bg-dark rounded-circle p-2"></span>
      </button>
    </div>
  );
}

/* ✅ Size & Price Section */
function SizePrice({
  product,
  sizes,
  discountPercent,
  deliveryDays,
  addToCart,
  cart,
  navigate,
}) {
  const [idx, setIdx] = useState(0);
  const [showBuy, setShowBuy] = useState(false);
  if (!sizes.length) return <div className="text-muted small">No sizes</div>;

  const s = sizes[idx];
  const finalPrice = priceAfterDiscount(s.price, discountPercent);

  const inCart = cart.some(
    (item) => item._id === product._id && item.size?.label === s.label
  );

  const outOfStock = s.stock === 0;

  return (
    <div>
      {/* Price Section */}
      <div className="d-flex align-items-center mb-2">
        <span className="fw-bold text-success">₹{finalPrice}</span>
        {discountPercent > 0 && (
          <>
            <small className="text-muted text-decoration-line-through ms-2">
              ₹{Number(s.price).toFixed(2)}
            </small>
            <span className="badge bg-danger ms-2">{discountPercent}% OFF</span>
          </>
        )}
      </div>

      {/* Size Options */}
      <div className="mb-3">
        {sizes.map((sz, i) => (
          <button
            key={i}
            type="button"
            className={`btn btn-sm me-1 mb-1 ${
              i === idx ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setIdx(i)}
          >
            {sz.label}
          </button>
        ))}
      </div>
      {/* ✅ Delivery Days */}
      {deliveryDays ? (
        <div className="mb-2 small text-muted">
          🚚 Estimated Delivery: {deliveryDays} days
        </div>
      ) : null}

      {/* Stock & Cart Actions */}
      {outOfStock ? (
        <div className="text-danger fw-bold">Out of Stock</div>
      ) : (
        <div className="d-flex gap-2">
          {!inCart ? (
            <button
              className="btn btn-sm p-1 btn-outline-secondary flex-fill"
              onClick={() => addToCart(product, s)}
            >
              🛒 Add to Cart
            </button>
          ) : (
            <button
              className="btn btn-sm btn-success flex-fill"
              onClick={() => navigate("/cart")}
            >
              🛒 Go to Cart
            </button>
          )}
          <button className="btn btn-sm btn-success flex-fill"
            onClick={() => setShowBuy(true)}>
              ⚡ Buy Now
          </button>
        </div>
      )}
      <BuyNowModal
        show={showBuy}
        onClose={() => setShowBuy(false)}
        product={product}
        size={s}
        onOrderComplete={(order) => {
          // order object returned from server
          // decide what to do: show success toast, redirect, etc.
          alert('Order placed! Order id: ' + order._id);
          window.location.reload(); // optional
        }}
      />
            
    </div>
    
  );

}
