// Esta función trae usuarios desde el backend Express.
export async function getUsers() {
    const apiHost = window.location.hostname;
    const response = await fetch(`http://${apiHost}:3000/api/users`);
    if (!response.ok) {
        throw new Error('Error fetching users');
    }
    return await response.json();
}
