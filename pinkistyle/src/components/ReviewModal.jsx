import React, { useState, useRef } from "react";

export default function ReviewModal({ show, onClose, productId, onReviewAdded }) {
  const [user, setUser] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // to reset file input after submit
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productId) {
      alert("Invalid product. Cannot submit review.");
      return;
    }

    if (images.length > 5) {
      alert("You can upload a maximum of 5 images.");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("user", user.trim());
      formData.append("rating", Number(rating)); // ensure number
      formData.append("comment", comment.trim());
      for (let i = 0; i < images.length; i++) {
        formData.append("images", images[i]);
      }

      const url = `http://localhost:5000/api/products/${productId}/reviews`;
      console.log("Submitting review to:", url);

      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        console.error("Review submit error:", res.status, data);
        alert(data.message || `Failed to add review (HTTP ${res.status})`);
        return;
      }

      // ✅ Reset form after success
      setUser("");
      setRating(5);
      setComment("");
      setImages([]);
      if (fileInputRef.current) fileInputRef.current.value = "";

      if (onReviewAdded) onReviewAdded();
      onClose();
    } catch (err) {
      console.error("Network/request failure:", err);
      alert("Something went wrong while submitting review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="modal-header">
              <h5 className="modal-title">Add Review</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={submitting}
              ></button>
            </div>

            <div className="modal-body">
              {/* User Name */}
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Your Name"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                required
              />

              {/* Rating */}
              <select
                className="form-select mb-2"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>
                    {r} Star{r > 1 ? "s" : ""}
                  </option>
                ))}
              </select>

              {/* Comment */}
              <textarea
                className="form-control mb-2"
                placeholder="Your comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />

              {/* Images */}
              <input
                type="file"
                multiple
                accept="image/*"
                ref={fileInputRef}
                className="form-control"
                onChange={(e) => setImages(e.target.files)}
              />
              <small className="text-muted">You can upload up to 5 images.</small>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
