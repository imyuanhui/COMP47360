import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuth2Redirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (accessToken && refreshToken) {
      // Store tokens in localStorage for header-based auth
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // Optional: clean up URL after storing
      window.history.replaceState({}, "", "/dashboard");

      navigate("/dashboard");
    } else {
      navigate("/?error=oauth");
    }
  }, [navigate]);

  return <p className="text-center mt-20 text-lg">Logging you in...</p>;
}