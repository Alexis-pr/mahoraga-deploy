const API_ORIGIN =
  window.location.port === '3000'
    ? window.location.origin
    : `${window.location.protocol}//${window.location.hostname}:3000`;

const USERS_API_URL = `${API_ORIGIN}/api/users`;

export async function getUsers() {
    const response = await fetch(USERS_API_URL);
    if (!response.ok) throw new Error('Error fetching users');
    return await response.json();
}

export async function loginUser(login, password) {
    const response = await fetch(`${USERS_API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ login, password })
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || 'Error logging in');
    }

    return await response.json();
}
