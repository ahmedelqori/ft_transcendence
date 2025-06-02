import { EnhancedFetch, eventBus } from "@/uccello/Uccello.js";
import { authState } from "./Auth";
import { router } from "@/router/Router";

const enhancedFetch = new EnhancedFetch();

function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  console.log(document.cookie);
  const parts: any = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

enhancedFetch.addRequestInterceptor((request) => {
  return {
    ...request,
    mode: "cors",
    credentials: "include",
    headers: {
      ...request.headers,
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  };
});

// enhancedFetch.addRequestInterceptor((request) => {
//   console.log("Outgoing request:", request);
//   return request;
// });

enhancedFetch.addResponseInterceptor(async (response) => {
  if (!response.ok && response.status == 401) {
    try {
      console.log(getCookie("refresh_token"));
      const res = await fetch(
        `${import.meta.env.VITE_URL_DEV}/api/account/login/refresh/`,
        {
          method: "POST",
          body: JSON.stringify({ refresh_token: getCookie("refresh_token") }),
        }
      );
      console.log(res);
      if (!res.ok) throw await res.json();
      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);
    } catch (err) {
      authState.setState({ isAuthenticated: false, user: null });
      await router.navigateTo("/login");
    }
  }
  return response;
});

// enhancedFetch.addResponseInterceptor(async (response) => {
//   if (response.ok) {
//     const clone = response.clone();
//     try {
//       const data = await clone.json();
//       console.log("Response data:", data);
//     } catch (e) {
//       console.log("Response could not be parsed as JSON");
//     }
//   }
//   return response;
// });

export default enhancedFetch;
