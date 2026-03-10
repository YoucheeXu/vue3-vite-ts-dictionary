import NetRquest from "../index";

export interface IRetType<T = any> {
    code: number;
    data: T;
    msg: string;
}

export function requestListLevels() {
    return NetRquest.get<IRetType>({
        url: `/recite/list/levels/`,
    });
}

export function requestListUsers() {
    return NetRquest.get<IRetType>({
        url: `/recite/list/users/`,
    });
}

export function requestGetUserLevelMap() {
    return NetRquest.get<IRetType>({
        url: `/recite/get/userlevelmap/`,
    });
}

export function requestSelectUserLevel(user: string, level: string){
    return NetRquest.put<IRetType>({
        url: `/recite/select/`,
        data: {
            'user': user,
            'level': level
        },
        headers: {
            'Content-Type': 'application/json', // Ensure JSON format (may be default in NetRquest)
            // If your NetRquest adds auth headers by default, disable for login:
            // 'No-Auth': 'true' 
        }
    });
}

export function requestNewUserLevel(user: string, level: string){
    return NetRquest.put<IRetType>({
        url: `/recite/new/`,
        data: {
            'user': user,
            'level': level
        },
        headers: {
            'Content-Type': 'application/json', // Ensure JSON format (may be default in NetRquest)
            // If your NetRquest adds auth headers by default, disable for login:
            // 'No-Auth': 'true' 
        }
    });
}

export function requestStart2Recite() {
    return NetRquest.get<IRetType>({
        url: `/recite/start2recite/`,
    });
}

export function requestGoStudyMode() {
    return NetRquest.get<IRetType>({
        url: `/recite/go2studymode/`,
    });
}

export function requestStudyNext() {
    return NetRquest.get<IRetType>({
        url: `/recite/studynext/`,
    });
}

export function requestGoTestMode() {
    return NetRquest.get<IRetType>({
        url: `/recite/go2testmode/`,
    });
}

export function requestTestNext() {
    return NetRquest.get<IRetType>({
        url: `/recite/testnext/`,
    });
}

export function requestCheckInput(word: string) {
    return NetRquest.get<IRetType>({
        url: `/recite/checkinput/${word}`,
    });
}

export function requestForget() {
    return NetRquest.get<IRetType>({
        url: `/recite/forget/`,
    });
}

export function requestChop() {
    return NetRquest.get<IRetType>({
        url: `/recite/chop/`,
    });
}

export function requestSaveProgress() {
    return NetRquest.get<IRetType>({
        url: `/recite/saveprogress/`,
    });
}
