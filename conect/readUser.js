// function to get all the users 
export async function getUsers() {
    const response = await fetch('http://localhost:3000/users');
    if (!response.ok) {
        throw new Error('Error fetching users');
    }
    return await response.json();
}