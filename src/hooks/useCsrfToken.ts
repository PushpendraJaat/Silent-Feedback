import { useState, useEffect } from "react";
import axios from "axios";

const useCsrfToken = () => {
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await axios.get("/api/auth/csrf");
        setCsrfToken(res.data.csrfToken);
      } catch (error) {
        console.error("Failed to fetch CSRF token", error);
      }
    };

    fetchToken();
  }, []);

  return csrfToken;
};

export default useCsrfToken;
