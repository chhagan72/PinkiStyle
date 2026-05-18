import React from "react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div>
      <h2>Dashboard (Overview)</h2>
      <div className="row g-3 mt-2">
        <div className="col-md-4"><div className="p-3 border rounded">Sales Summary</div></div>
        <div className="col-md-4"><div className="p-3 border rounded">Order Statistics</div></div>
        <div className="col-md-4"><div className="p-3 border rounded">User Activity</div></div>
        <div className="col-md-4"><div className="p-3 border rounded">Low Stock Alerts</div></div>
        <div className="col-md-4"><div className="p-3 border rounded">Top Selling Products</div></div>
        <div className="col-md-4"><div className="p-3 border rounded">Recent Orders</div></div>
      </div>

      <div className="mt-4 d-flex gap-2 flex-wrap">
        <Link to="/admin/sales-summary" className="btn btn-outline-primary btn-sm">Sales Summary</Link>
        <Link to="/admin/order-stats" className="btn btn-outline-primary btn-sm">Order Stats</Link>
        <Link to="/admin/user-activity" className="btn btn-outline-primary btn-sm">User Activity</Link>
        <Link to="/admin/low-stock" className="btn btn-outline-primary btn-sm">Low Stock</Link>
        <Link to="/admin/top-products" className="btn btn-outline-primary btn-sm">Top Products</Link>
        <Link to="/admin/recent-orders" className="btn btn-outline-primary btn-sm">Recent Orders</Link>
      </div>
    </div>
  );
}
