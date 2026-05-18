// src/admin/ProductForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

const CATEGORY_OPTIONS = [
  "Jeans", "Tshirt", "Shirt", "NightPant", "Sports", 
  "Saree", "Blouse", "LJeans", "Top", "Children", "OldMen"
];

function priceAfterDiscount(price, discountPercent) {
  const p = Number(price) || 0;
  const d = Number(discountPercent) || 0;
  return Math.max(0, p - (p * d) / 100).toFixed(2);
}

export default function ProductForm({ mode = "create" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === "edit";

  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [categories, setCategories] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [deliveryDays, setDeliveryDays] = useState(""); // ✅ NEW
  const [visible, setVisible] = useState(true);

  const [sizes, setSizes] = useState([{ label: "M", price: 0, stock: 0 }]);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);

  const [newFiles, setNewFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removeImageUrls, setRemoveImageUrls] = useState([]);

  // Load for edit
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const { data } = await api.get(`/api/admin/products/${id}`);
        setTitle(data.title || "");
        setDetails(data.details || "");
        setCategories(data.categories || []);
        setDiscountPercent(data.discountPercent || 0);
        setDeliveryDays(data.deliveryDays ?? ""); // ✅ load from DB
        setVisible(!!data.visible);
        setSizes(data.sizes?.length ? data.sizes : [{ label: "M", price: 0, stock: 0 }]);
        setExistingImages(data.images || []);
        setSelectedSizeIndex(0);
      } catch (err) {
        console.error(err);
        alert("Failed to load product for editing.");
      }
    })();
  }, [id, isEdit]);

  const effectivePrice = useMemo(() => {
    const size = sizes[selectedSizeIndex] || sizes[0] || { price: 0 };
    return priceAfterDiscount(size.price ?? 0, discountPercent);
  }, [sizes, selectedSizeIndex, discountPercent]);

  function toggleCategory(cat) {
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }

  function updateSize(i, field, value) {
    setSizes(prev => {
      const copy = prev.slice();
      copy[i] = { ...copy[i], [field]: field === "label" ? value : Number(value) };
      return copy;
    });
  }

  function addSize() {
    setSizes(prev => [...prev, { label: "", price: 0, stock: 0 }]);
  }

  function removeSize(i) {
    setSizes(prev => prev.filter((_, idx) => idx !== i));
    if (selectedSizeIndex >= i && selectedSizeIndex > 0) {
      setSelectedSizeIndex(selectedSizeIndex - 1);
    }
  }

  function onPickFiles(e) {
    const files = Array.from(e.target.files || []);
    const allowed = Math.max(0, 10 - (existingImages.length + newFiles.length));
    setNewFiles(prev => [...prev, ...files.slice(0, allowed)]);
  }

  function removeNewFile(idx) {
    setNewFiles(prev => prev.filter((_, i) => i !== idx));
  }

  function removeExistingImage(url) {
    setExistingImages(prev => prev.filter(u => u !== url));
    setRemoveImageUrls(prev => [...prev, url]);
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return alert("Title is required");
    if (!sizes.length) return alert("Add at least one size");
    const totalImgs = existingImages.length + newFiles.length;
    if (!isEdit && totalImgs < 1) return alert("Add at least one image");
    if (totalImgs > 10) return alert("Max 10 images allowed");

    const fd = new FormData();
    fd.append("title", title.trim());
    fd.append("details", details);
    fd.append("categories", JSON.stringify(categories));
    fd.append("sizes", JSON.stringify(sizes.map(s => ({
      label: s.label, price: Number(s.price || 0), stock: Number(s.stock || 0)
    }))));
    fd.append("discountPercent", Number(discountPercent || 0));
    fd.append("deliveryDays", deliveryDays ? Number(deliveryDays) : ""); // ✅ send
    fd.append("visible", String(visible));

    try {
      if (isEdit) {
        if (removeImageUrls.length) {
          fd.append("removeImageUrls", JSON.stringify(removeImageUrls));
        }
        newFiles.forEach(f => fd.append("newImages", f));
        await api.put(`/api/admin/products/${id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Product updated");
      } else {
        newFiles.forEach(f => fd.append("images", f));
        await api.post(`/api/admin/products`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Product created");
      }
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err.message || "Request failed";
      alert(`Error: ${msg}`);
    }
  }

  async function onDelete() {
    if (!isEdit) return;
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/api/admin/products/${id}`);
      alert("Product deleted");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err.message || "Request failed";
      alert(`Error: ${msg}`);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="container py-4"
    >
      <div className="text-center mb-4">
        <h2 className="fw-bold">{isEdit ? "Edit Product" : "Add Product"}</h2>
        <p className="text-muted">Fill in the details below to {isEdit ? "update" : "create"} your product</p>
      </div>

      <div className="alert alert-primary d-flex justify-content-between align-items-center shadow-sm">
        <div>
          <strong>Preview Price:</strong> {effectivePrice} (after {discountPercent}%)
        </div>
        <div>
          {sizes.map((s, i) => (
            <button
              key={i}
              type="button"
              className={`btn btn-sm me-1 ${i === selectedSizeIndex ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setSelectedSizeIndex(i)}
            >
              {s.label || `#${i + 1}`}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} className="card shadow-lg p-4 border-0 rounded-3">
        {/* Title */}
        <div className="mb-4">
          <label className="form-label fw-semibold">Product Title</label>
          <input className="form-control form-control-lg" value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter product name" />
        </div>

        {/* Categories */}
        <div className="mb-4">
          <label className="form-label fw-semibold d-block">Categories</label>
          <div className="d-flex flex-wrap gap-3">
            {CATEGORY_OPTIONS.map(cat => (
              <div key={cat} className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`cat-${cat}`}
                  checked={categories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                />
                <label htmlFor={`cat-${cat}`} className="form-check-label">{cat}</label>
              </div>
            ))}
          </div>
          <div className="form-text">Choose one or more categories.</div>
        </div>

        {/* Discount & Delivery & Visibility */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <label className="form-label fw-semibold">Discount (%)</label>
            <input type="number" min="0" max="100" className="form-control" value={discountPercent} onChange={e => setDiscountPercent(e.target.value)} />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Estimated Delivery (Days)</label>
            <input type="number" min="1" className="form-control" value={deliveryDays} onChange={e => setDeliveryDays(e.target.value)} />
          </div>
          <div className="col-md-4 d-flex align-items-end">
            <div className="form-check">
              <input id="visible" className="form-check-input" type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} />
              <label htmlFor="visible" className="form-check-label ms-2">Visible</label>
            </div>
          </div>
        </div>

        {/* Sizes */}
        <div className="mb-4">
          <label className="form-label fw-semibold">Sizes (price & stock)</label>
          <div className="list-group shadow-sm">
            {sizes.map((s, i) => (
              <div key={i} className="list-group-item border-0 border-bottom">
                <div className="row g-3 align-items-end">
                  <div className="col-md-3">
                    <label className="form-label">Size Label</label>
                    <input className="form-control" value={s.label} onChange={e => updateSize(i, "label", e.target.value)} placeholder="e.g. 30, M, L" />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Price</label>
                    <input type="number" min="0" className="form-control" value={s.price} onChange={e => updateSize(i, "price", e.target.value)} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Stock</label>
                    <input type="number" min="0" className="form-control" value={s.stock} onChange={e => updateSize(i, "stock", e.target.value)} />
                  </div>
                  <div className="col-md-3">
                    <button type="button" className="btn btn-outline-danger w-100" onClick={() => removeSize(i)} disabled={sizes.length === 1}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-outline-primary mt-3" onClick={addSize}>+ Add Size</button>
        </div>

        {/* Details */}
        <div className="mb-4">
          <label className="form-label fw-semibold">Product Details</label>
          <textarea className="form-control" rows={4} value={details} onChange={e => setDetails(e.target.value)} placeholder="Enter detailed description..." />
        </div>

        {/* Images */}
        <div className="mb-4">
          <label className="form-label fw-semibold">Images (1–10)</label>
          <input type="file" accept="image/*" multiple className="form-control" onChange={onPickFiles} />
          <div className="form-text">Upload up to 10 images.</div>

          {existingImages.length > 0 && (
            <>
              <div className="mt-3 fw-bold">Existing Images</div>
              <div className="d-flex flex-wrap gap-3 mt-2">
                {existingImages.map((url, i) => (
                  <div key={i} className="position-relative border rounded shadow-sm p-1">
                    <img src={`http://localhost:5000${url}`} alt="" style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8 }} />
                    <button type="button" className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1" onClick={() => removeExistingImage(url)}>×</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {newFiles.length > 0 && (
            <>
              <div className="mt-3 fw-bold">New Images</div>
              <div className="d-flex flex-wrap gap-3 mt-2">
                {newFiles.map((f, i) => {
                  const url = URL.createObjectURL(f);
                  return (
                    <div key={i} className="position-relative border rounded shadow-sm p-1">
                      <img src={url} alt="" style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8 }} />
                      <button type="button" className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1" onClick={() => removeNewFile(i)}>×</button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="d-grid gap-3">
          <button className="btn btn-primary btn-lg shadow-sm" type="submit">
            {isEdit ? "Save Changes" : "Create Product"}
          </button>
          {isEdit && (
            <button type="button" className="btn btn-outline-danger btn-lg shadow-sm" onClick={onDelete}>
              Delete Product
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
}
