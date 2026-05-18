import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

export default function Products() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/api/admin/products");
      setItems(data);
    })().catch(console.error);
  }, []);

  return (
    <div className="container py-4">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary mb-0">📦 Products</h2>
        <Link to="/admin/products/new" className="btn btn-primary shadow-sm">
          + Add Product
        </Link>
      </div>

      {/* Products Table */}
      <div className="card shadow-sm border-0 rounded-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col">Image</th>
                  <th scope="col">Title</th>
                  <th scope="col">Categories</th>
                  <th scope="col">Visible</th>
                  <th scope="col">Sizes</th>
                  <th scope="col" className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => {
                  const firstImg = p.images?.[0]
                    ? `http://localhost:5000${p.images[0]}`
                    : "";

                  return (
                    <tr key={p._id} className="align-middle">
                      <td style={{ width: 80 }}>
                        {firstImg ? (
                          <img
                            src={firstImg}
                            alt=""
                            className="rounded"
                            style={{
                              width: 60,
                              height: 60,
                              objectFit: "cover",
                              border: "2px solid #f1f1f1",
                            }}
                          />
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="fw-semibold">{p.title}</td>
                      <td>
                        {(p.categories || []).length > 0 ? (
                          (p.categories || []).map((c, i) => (
                            <span
                              key={i}
                              className="badge bg-secondary-subtle text-dark me-1"
                            >
                              {c}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td>
                        {p.visible ? (
                          <span className="badge bg-success">Yes</span>
                        ) : (
                          <span className="badge bg-danger">No</span>
                        )}
                      </td>
                      <td>
                        {(p.sizes || []).map((s) => (
                          <span
                            key={s.label}
                            className="badge bg-light text-dark border me-1"
                          >
                            {s.label}: ₹{s.price}
                          </span>
                        ))}
                      </td>
                      <td className="text-end">
                        <Link
                          to={`/admin/products/${p._id}/edit`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          ✏️ Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}

                {items.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
