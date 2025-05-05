import { EnhancedFetch } from "@/uccello/Uccello.js";

const enhancedFetch = new EnhancedFetch();

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

// enhancedFetch.addResponseInterceptor(async (response) => {
//   if (!response.ok) {
//     console.error("Error response:", response.status, response.statusText);
//   }
//   return response;
// });

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
