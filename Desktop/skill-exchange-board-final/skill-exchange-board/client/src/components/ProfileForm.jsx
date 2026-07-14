import { useState } from "react";

export default function ProfileForm({ user, onSave }) {
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [location, setLocation] = useState(user?.location || "");
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(
    user?.photoUrl ? `http://localhost:5000${user.photoUrl}` : ""
  );
  const [saving, setSaving] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("bio", bio);
    formData.append("location", location);
    if (photoFile) formData.append("photo", photoFile);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} style={{ maxWidth: "420px" }}>
      <h2>Edit Profile</h2>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "0.5rem" }}>
        {preview ? (
          <img
            src={preview}
            alt="Profile preview"
            style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", marginBottom: "0.5rem" }}
          />
        ) : (
          <div
            style={{
              width: 96, height: 96, borderRadius: "50%",
              background: "#e0e0e0", marginBottom: "0.5rem",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#888", fontSize: "0.8rem",
            }}
          >
            No photo
          </div>
        )}
        <input type="file" accept="image/*" onChange={handlePhotoChange} />
      </div>

      <label>Name</label>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

      <label>Location</label>
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="e.g. Downtown, Westside — neighborhood only, not full address"
      />

      <label>Bio</label>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        maxLength={300}
        rows={4}
        style={{ padding: "0.6rem", marginTop: "0.25rem", border: "1px solid #ccc", borderRadius: "6px", fontFamily: "inherit" }}
      />
      <p style={{ fontSize: "0.75rem", color: "#888", textAlign: "right" }}>{bio.length}/300</p>

      <button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}