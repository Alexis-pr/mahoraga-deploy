// Este DTO define el contrato que el frontend envía al backend.
export class UserCreateDTO {
  constructor({
    user_name,
    email,
    password,
    user_status = "active",
    id_level = 2,
    id_language = 1,
  }) {
    this.user_name = user_name;
    this.email = email;
    this.password = password;
    this.user_status = user_status;
    this.id_level = id_level;
    this.id_language = id_language;
  }
}

// Esta URL usa el host actual del navegador para evitar cruces localhost/127.0.0.1.
const API_HOST = window.location.hostname;
const USERS_API_URL = `http://${API_HOST}:3000/api/users`;

export async function createUser(userDTO) {
  const response = await fetch(USERS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userDTO),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody.message || "Error creando usuario";
    const detail = errorBody.error ? ` (${errorBody.error})` : "";
    throw new Error(`${message}${detail}`);
  }

  return await response.json();
}
