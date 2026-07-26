import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./auth.css";

const CreateListing = () => {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    type: "offer", // Match with backend lowercase enum ["offer", "request"]
    availability: "",
    radiusKm: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Required fields client-side verification
    if (!formData.title || !formData.category || !formData.description || !formData.availability) {
      setError("Please fill all the required fields.");
      return;
    }

    try {
      // LocalStorage se logged-in user ka token nikalna validation ke liye
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Secure backend route connection
        },
        body: JSON.stringify({
          ...formData,
          radiusKm: formData.radiusKm ? Number(formData.radiusKm) : 5, // Parsing into number
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess("Listing created successfully! Redirecting...");
        setTimeout(() => {
          navigate("/"); // Redirect to home (no /dashboard page exists yet)
        }, 2000);
      } else {
        setError(data.message || "Failed to create listing.");
      }
    } catch (err) {
      console.error("Frontend submit error:", err);
      setError("Server connection failed. Please try again later.");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Create a Listing</h2>

        {error && <p className="auth-error">{error}</p>}
        {success && <p style={{ color: "#2e7d32", fontSize: "0.85rem", marginTop: "0.5rem" }}>{success}</p>}

        <label>Listing Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., UI/UX Design Mentorship"
          required
        />

        <label>Listing Type *</label>
        <select name="type" value={formData.type} onChange={handleChange}>
          <option value="offer">Offer (I want to teach / share)</option>
          <option value="request">Request (I want to learn / find)</option>
        </select>

        <label>Category *</label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="e.g., Programming, Language, Graphics"
          required
        />

        <label>Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Tell others what you are sharing or looking for..."
          rows="4"
          required
        ></textarea>

        <label>Availability *</label>
        <input
          type="text"
          name="availability"
          value={formData.availability}
          onChange={handleChange}
          placeholder="e.g., Weekends, Mon-Wed 5PM, Online"
          required
        />

        <label>Radius (in Kilometers)</label>
        <input
          type="number"
          name="radiusKm"
          value={formData.radiusKm}
          onChange={handleChange}
          placeholder="e.g., 5, 10 (leave blank for default 5km)"
          min="0"
        />

        <button type="submit">Save Listing to DB</button>
      </form>
    </div>
  );
};

export default CreateListing;
