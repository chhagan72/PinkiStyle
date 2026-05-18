import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ReviewModal from "../components/ReviewModal";

// Helper function
function priceAfterDiscount(price, discountPercent) {
  const p = Number(price) || 0;
  const d = Number(discountPercent) || 0;
  return Math.max(0, p - (p * d) / 100);
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showReview, setShowReview] = useState(false);

  // Fetch product
  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data))
      .catch((err) => console.error("Error fetching product:", err));
  }, [id]);

  if (!product) return <div className="text-center mt-5">Loading...</div>;

  const size = product.sizes?.[selectedSizeIdx];
  const singleFinalPrice = size
    ? priceAfterDiscount(size.price, product.discountPercent || 0)
    : 0;

  const finalPrice = (singleFinalPrice * quantity).toFixed(2);
  const originalPrice = size ? (Number(size.price) * quantity).toFixed(2) : 0;
  const savings =
    product.discountPercent > 0
      ? (originalPrice - finalPrice).toFixed(2)
      : 0;

  // Check if in cart
  const inCart = cart.some(
    (item) => item._id === product._id && item.size?.label === size?.label
  );

  const outOfStock = size?.stock === 0;

  return (
    <div className="container py-4">
      {/* Custom style for carousel and buttons */}
      <style>{`
        .carousel-container {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          border-radius: 1rem;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .carousel-container:hover {
          transform: scale(1.02);
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }
        .carousel-control-prev-icon,
        .carousel-control-next-icon {
          background-size: 100% 100%;
        }
        .carousel-control-prev-icon {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='%23008000' viewBox='0 0 16 16'%3e%3cpath d='M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z'/%3e%3c/svg%3e");
        }
        .carousel-control-next-icon {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='%23008000' viewBox='0 0 16 16'%3e%3cpath d='M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
        }
      `}</style>

      <button
        className="btn btn-outline-secondary mb-4 shadow-sm rounded-pill px-3"
        onClick={() => navigate(-1)}
      >
        ⬅ Back
      </button>

      <div className="row g-4">
        {/* Product Images */}
        <div className="col-md-6">
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
            {product.images?.length ? (
              <Carousel images={product.images} id={product._id} />
            ) : (
              <div
                className="bg-light w-100 d-flex align-items-center justify-content-center"
                style={{ minHeight: 300 }}
              >
                <span className="text-muted">No Image Available</span>
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <h2 className="fw-bold">{product.title}</h2>
            <p className="text-muted">{product.details || product.description}</p>

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="mb-3">
                <strong className="d-block mb-2">Select Size:</strong>
                <div className="d-flex flex-wrap gap-2">
                  {product.sizes.map((s, idx) => (
                    <button
                      key={idx}
                      className={`btn btn-sm rounded-pill px-3 ${
                        selectedSizeIdx === idx
                          ? "btn-primary"
                          : "btn-outline-primary"
                      }`}
                      onClick={() => setSelectedSizeIdx(idx)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            {size && !outOfStock && (
              <div className="d-flex align-items-center mb-3">
                <label className="me-2 fw-semibold">Qty:</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="form-control form-control-sm rounded-pill text-center shadow-sm"
                  style={{ width: "80px" }}
                />
              </div>
            )}

            {/* Price */}
            {size && (
              <div className="mb-4">
                <span className="fw-bold text-success fs-4">
                  ₹{finalPrice}
                </span>
                {product.discountPercent > 0 && (
                  <>
                    <small className="text-muted text-decoration-line-through ms-2 fs-6">
                      ₹{originalPrice}
                    </small>
                    <span className="badge bg-danger ms-2 rounded-pill">
                      {product.discountPercent}% OFF
                    </span>
                    <div className="text-success fw-semibold mt-2">
                      You Save ₹{savings}
                    </div>
                  </>
                )}
              </div>
            )}
            {/* ✅ Delivery Days */}
            {product.deliveryDays && (
              <div className="mb-4">
                <span className="badge bg-info text-dark px-3 py-2 rounded-pill shadow-sm">
                  🚚 Estimated Delivery: {product.deliveryDays} days
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="d-flex flex-wrap gap-2">
              {outOfStock ? (
                <button className="btn btn-danger flex-fill rounded-pill shadow-sm fw-bold">
                  ❌ Out of Stock
                </button>
              ) : (
                <>
                  {size && !inCart && (
                    <button
                      className="btn btn-outline-dark flex-fill rounded-pill shadow-sm"
                      style={{ flex: "1 1 50%" }}
                      onClick={() => addToCart(product, size, quantity)}
                    >
                      🛒 Add to Cart
                    </button>
                  )}
                  {size && inCart && (
                    <button
                      className="btn btn-success flex-fill rounded-pill shadow-sm"
                      style={{ flex: "1 1 50%" }}
                      onClick={() => navigate("/cart")}
                    >
                      🛒 Go to Cart
                    </button>
                  )}
                  <button
                    className="btn btn-primary flex-fill rounded-pill shadow-sm"
                    style={{ flex: "1 1 50%" }}
                  >
                    ⚡ Buy Now
                  </button>
                </>
              )}
              <button
                className="btn btn-warning flex-fill rounded-pill shadow-sm"
                onClick={() => setShowReview(true)}
              >
                ⭐ Add Review
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews */}
      <div className="mt-5">
        <h4 className="fw-bold mb-3">⭐ Customer Reviews</h4>
        {product.reviews?.length > 0 ? (
          <div className="list-group shadow-sm rounded-4">
            {product.reviews.map((review, idx) => (
              <div
                key={idx}
                className="list-group-item border-0 border-bottom py-3"
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <strong>{review.user}</strong>
                  <span className="text-warning">
                    {"⭐".repeat(review.rating || 0)}
                  </span>
                </div>
                <p className="mb-2">{review.comment}</p>
                {review.images?.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mb-2">
                    {review.images.map((img, i) => (
                      <img
                        key={i}
                        src={`http://localhost:5000${img}`}
                        alt="review-img"
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                        }}
                        className="rounded border shadow-sm"
                      />
                    ))}
                  </div>
                )}
                <small className="text-muted">
                  {review.date
                    ? new Date(review.date).toLocaleDateString()
                    : ""}
                </small>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted fst-italic">No reviews yet.</p>
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        show={showReview}
        onClose={() => setShowReview(false)}
        productId={product._id}
        onReviewAdded={() => {
          // reload product reviews after adding
          fetch(`http://localhost:5000/api/products/${id}`)
            .then((res) => res.json())
            .then((data) => setProduct(data));
        }}
      />
    </div>
  );
}

/* Carousel Component */
function Carousel({ images, id }) {
  const carouselId = `carousel-${id}`;
  return (
    <div className="carousel-container">
      <div
        id={carouselId}
        className="carousel slide"
        data-bs-ride="carousel"
        data-bs-interval="3000"  // Auto slide every 3s
      >
        <div className="carousel-inner rounded-4 overflow-hidden shadow-sm">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`carousel-item ${idx === 0 ? "active" : ""}`}
            >
              <img
                src={`http://localhost:5000${img}`}
                alt={`slide-${idx}`}
                className="d-block w-100 img-fluid"
                style={{ objectFit: "contain", maxHeight: "600px" }}
              />
            </div>
          ))}
        </div>
        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target={`#${carouselId}`}
          data-bs-slide="prev"
        >
          <span className="carousel-control-prev-icon"></span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target={`#${carouselId}`}
          data-bs-slide="next"
        >
          <span className="carousel-control-next-icon"></span>
        </button>
      </div>
    </div>
  );
}
