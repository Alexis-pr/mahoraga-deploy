import { createUsers as createUsersRepo, getUsers as getUsersRepo, loginUserQuery as loginUsersRepo, processInterviewResult as processInterviewResultRepo, getUserProgress as getUserProgressRepo, getUserTopicProgressData as getUserTopicProgressDataRepo } from './user.repository.js'

export const getUsers = async () => getUsersRepo()

export const createUsers = async (user_name, email, password, user_status, id_language, id_level) => {
  return createUsersRepo(user_name, email, password, user_status, id_language, id_level)
}

export const loginUserQuery = async (login, password) => {
  return loginUsersRepo(login, password)
}

export const processInterviewResult = async (id_user, id_session) => {
  return processInterviewResultRepo(id_user, id_session)
}

export const getUserProgress = async (id_user) => {
  return getUserProgressRepo(id_user)
}

export const getUserTopicProgressData = async (id_user) => {
  return getUserTopicProgressDataRepo(id_user)
}
