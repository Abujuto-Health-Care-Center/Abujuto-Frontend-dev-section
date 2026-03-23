// api.js

const BASE_URL = "https://abojuto.onrender.com/";

export async function loginUser(credentials) {
  try {
    const response = await fetch(`${BASE_URL}api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();

    return {
      ok: response.ok,
      data
    };

  } catch (error) {
    return {
      ok: false,
      data: { message: "Network error" }
    };
  }
}