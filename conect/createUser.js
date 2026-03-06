//Create Users with DTO ()
export class UserCreateDTO {
  constructor({
    user_name,
    email,
    password,
    id_status = "true",   //Value for default
    id_level = "Junior",
    id_language = "espanish"
  }) {
    this.user_name = user_name;
    this.email = email;
    this.password = password;
    this.id_status = id_status;
    this.id_level = id_level;
    this.id_language = id_language;
  }
}
export async function createUser(userDTO) {
  const response = await fetch('http://localhost:3000/users', {  // change URL to JSON Server
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userDTO)
  });

  if (!response.ok) {
    throw new Error('Error creando usuario');
  }

  return await response.json();
}