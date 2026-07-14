import { Link, useNavigate } from "react-router-dom";
import { getToken, clearToken } from "../lib/api";

function ExchangeMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M6 10h13l-3.5-3.5" stroke="#E8A33D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 18H9l3.5 3.5" stroke="#1F4B3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!getToken();

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  return (
    <nav className="border-b" style={{ borderColor: "var(--color-border)" }}>
      <div
        className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "3rem",
          flexWrap: "wrap",
          maxWidth: "64rem",
          margin: "0 auto",
          padding: "1rem 1.5rem",
        }}
      >
        <Link to="/" className="flex items-center gap-2">
          <ExchangeMark />
          <span className="font-display text-lg font-semibold" style={{ color: "var(--color-primary)" }}>
            Skill Exchange
          </span>
        </Link>

        <div
          className="flex items-center gap-6 text-sm font-medium"
          style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}
        >
          {isLoggedIn ? (
            <>
              <Link to="/create-listing" className="hover:opacity-70" style={{ color: "var(--color-text)" }}>
                Create Listing
              </Link>
              <Link to="/my-listings" className="hover:opacity-70" style={{ color: "var(--color-text)" }}>
                My Listings
              </Link>
              <Link to="/profile" className="hover:opacity-70" style={{ color: "var(--color-text)" }}>
                Profile
              </Link>
              <button onClick={handleLogout} className="hover:opacity-70" style={{ color: "var(--color-text-muted)" }}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:opacity-70" style={{ color: "var(--color-text)" }}>
                Log in
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-md text-white text-sm font-medium"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}