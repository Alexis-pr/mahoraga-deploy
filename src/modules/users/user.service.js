import { createUsers as createUsersRepo, getUsers as getUsersRepo, loginUserQuery as loginUsersRepo } from './user.repository.js'

export const getUsers = async () => getUsersRepo()

export const createUsers = async (user_name, email, password, user_status, id_language, id_level) => {
  return createUsersRepo(user_name, email, password, user_status, id_language, id_level)
}

export const loginUserQuery = async (login, password) => {
  return loginUsersRepo(login, password)
}
