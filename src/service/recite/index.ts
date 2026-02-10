import NetRquest from "../index";

interface IDataType<T = any> {
    code: number;
    msg: string;
    data: T;
}

interface IRetType{
    response: IDataType;
    code: number;
}

export function requestStart2Recite(level: string) {
    return NetRquest.get<IRetType>({
        url: `/recite/start2recite/${level}/`,
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
