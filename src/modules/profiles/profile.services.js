import { createProfile as createProfileRepo } from './profile.repository.js'

export const createProfile = async (id_user, photo_url) => {
    return createProfileRepo(id_user, photo_url)
}
