// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:3000",
// });

// // Request Interceptor: Attach token to every outgoing request
// api.interceptors.request.use((config) => {
//   if (typeof window !== "undefined") {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//   }
//   return config;
// });

// // Response Interceptor: Catch 401s and kick to login
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // Only redirect if it's a 401 AND we aren't already on the login page
//     if (error.response?.status === 401) {
//       if (
//         typeof window !== "undefined" &&
//         window.location.pathname !== "/login"
//       ) {
//         localStorage.removeItem("token");
//         localStorage.removeItem("user");

//         // window.location.href is better than router.push here
//         // because it clears any stale React state
//         window.location.href = "/login?expired=true";
//       }
//     }
//     return Promise.reject(error);
//   },
// );

// export default api;

import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Request Interceptor: Attach token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// Response Interceptor: Handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login?expired=true";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
