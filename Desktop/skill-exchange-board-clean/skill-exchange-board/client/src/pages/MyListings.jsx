import React, { useEffect, useState } from "react";
import "./myListings.css";

const emptyForm = {
  title: "",
  category: "",
  description: "",
  type: "offer",
  availability: "",
  radiusKm: "",
  status: "active",
};

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");

  const fetchMyListings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/listings/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load listings");
      setListings(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEditing = (listing) => {
    setEditingId(listing._id);
    setEditForm({
      title: listing.title,
      category: listing.category,
      description: listing.description,
      type: listing.type,
      availability: listing.availability,
      radiusKm: listing.radiusKm,
      status: listing.status,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm(emptyForm);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveEdit = async (id) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:5000/api/listings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...editForm,
          radiusKm: editForm.radiusKm ? Number(editForm.radiusKm) : 5,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update listing");

      setListings((prev) =>
        prev.map((l) => (l._id === id ? data.data : l))
      );
      cancelEditing();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this listing? This can't be undone."
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`http://localhost:5000/api/listings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete listing");

      setListings((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "3rem" }}>Loading your listings...</p>;
  }

  return (
    <div className="my-listings-container">
      <h2>My Listings</h2>

      {error && <p className="auth-error">{error}</p>}

      {listings.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888" }}>
          You haven't created any listings yet.
        </p>
      ) : (
        <div className="listings-grid">
          {listings.map((listing) => (
            <div className="listing-card" key={listing._id}>
              {editingId === listing._id ? (
                <div className="listing-edit-form">
                  <label>Title</label>
                  <input
                    type="text"
                    name="title"
                    value={editForm.title}
                    onChange={handleEditChange}
                  />

                  <label>Type</label>
                  <select name="type" value={editForm.type} onChange={handleEditChange}>
                    <option value="offer">Offer</option>
                    <option value="request">Request</option>
                  </select>

                  <label>Category</label>
                  <input
                    type="text"
                    name="category"
                    value={editForm.category}
                    onChange={handleEditChange}
                  />

                  <label>Description</label>
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                    rows={3}
                  />

                  <label>Availability</label>
                  <input
                    type="text"
                    name="availability"
                    value={editForm.availability}
                    onChange={handleEditChange}
                  />

                  <label>Radius (km)</label>
                  <input
                    type="number"
                    name="radiusKm"
                    value={editForm.radiusKm}
                    onChange={handleEditChange}
                    min={0}
                  />

                  <label>Status</label>
                  <select name="status" value={editForm.status} onChange={handleEditChange}>
                    <option value="active">Active</option>
                    <option value="matched">Matched</option>
                    <option value="closed">Closed</option>
                  </select>

                  <div className="listing-actions">
                    <button
                      className="btn-save"
                      onClick={() => saveEdit(listing._id)}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button className="btn-cancel" onClick={cancelEditing}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="listing-header">
                    <span className={`listing-type ${listing.type}`}>
                      {listing.type}
                    </span>
                    <span className={`listing-status ${listing.status}`}>
                      {listing.status}
                    </span>
                  </div>
                  <h3>{listing.title}</h3>
                  <p className="listing-category">{listing.category}</p>
                  <p>{listing.description}</p>
                  <p className="listing-meta">
                    Availability: {listing.availability || "—"}
                  </p>
                  <p className="listing-meta">Radius: {listing.radiusKm} km</p>

                  <div className="listing-actions">
                    <button className="btn-edit" onClick={() => startEditing(listing)}>
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(listing._id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;
