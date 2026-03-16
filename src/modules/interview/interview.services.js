import {
    createInterview as createInterviewRepo,
    endInterview as endInterviewRepo
} from "./interview.repository.js";

export const createInterview = async (payload) => {
    return createInterviewRepo(payload);
}

export const endInterview = async (id_session, date_fin) => {
    return endInterviewRepo(id_session, date_fin);
}
