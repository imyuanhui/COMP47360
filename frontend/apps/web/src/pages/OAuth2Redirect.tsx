import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuth2Redirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      navigate("/dashboard");
    } else {
      navigate("/?error=oauth");
    }
  }, []);

  return <p className="text-center mt-20 text-lg">Logging you in...</p>;
}
