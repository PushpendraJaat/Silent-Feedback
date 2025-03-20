import csrf from "csurf";

export const csrfProtection = csrf({
  cookie: true, // Store CSRF token in a cookie
});
