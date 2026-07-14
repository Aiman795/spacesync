import { useState, useEffect } from "react";
import ProfileForm from "../components/ProfileForm";
import { getProfile, updateProfile } from "../lib/api";
import "./auth.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getProfile()
      .then((data) => setUser(data.user))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (formData) => {
    const res = await updateProfile(formData);
    setUser(res.user);
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: "3rem" }}>Loading...</p>;
  if (error) return <p style={{ textAlign: "center", marginTop: "3rem", color: "#d32f2f" }}>{error}</p>;

  return (
    <div className="auth-container">
      <ProfileForm user={user} onSave={handleSave} />
    </div>
  );
}