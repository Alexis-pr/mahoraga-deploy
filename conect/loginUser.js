// Esta URL usa el mismo host del navegador y el puerto del backend.
const API_HOST = window.location.hostname;
const LOGIN_API_URL = `http://${API_HOST}:3000/api/auth/login`;

// Este DTO representa exactamente lo que el backend espera para login.
export class LoginDTO {
  constructor({ identifier, password }) {
    this.identifier = identifier;
    this.password = password;
  }
}

// Esta funcion envia credenciales y devuelve el usuario autenticado.
export async function loginUser(loginDTO) {
  const response = await fetch(LOGIN_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginDTO),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || "Error iniciando sesion");
  }

  return await response.json();
}
