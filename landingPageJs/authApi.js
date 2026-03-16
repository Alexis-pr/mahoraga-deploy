const API_ORIGIN =
  window.location.port === "3000"
    ? window.location.origin
    : `${window.location.protocol}//${window.location.hostname}:3000`;

const USERS_API_URL = `${API_ORIGIN}/api/users`;

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
    throw new Error(errorBody.error || "Error creating account. Try again later.");
  }

  return await response.json();
}

export async function loginUser(login, password) {
  const response = await fetch(`${USERS_API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ login, password }),
  });

  const payload = await response.json().catch(() => ({}));
  console.log("loginUser response payload", payload);

  if (!response.ok) {
    throw new Error(payload.error || "Error logging in");
  }

  return payload;
}

export async function fetchUsers() {
  const response = await fetch(USERS_API_URL);
  const payload = await response.json().catch(() => ({}));
  console.log("fetchUsers payload", payload);

  if (!response.ok) {
    throw new Error(payload.error || "Error fetching users");
  }

  return payload;
}

// Obtiene todos los usuarios para resolver id_user si el login no lo trae.
export async function getUsers() {
  const response = await fetch(USERS_API_URL, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || 'Error fetching users');
  }

  return await response.json();
}
