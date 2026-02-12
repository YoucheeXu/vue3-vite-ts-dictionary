export interface IReciteState {
    user: string;
    level: string;
    dictId: number;
    audioId: number;
    curDictId: number;
    curWord: string;
    num2Learn: number;
    num2Test: number;
}

export interface ICountDetail {
    allCount: number;
    newCount: number;
    fnshdCount: number;
    inProgressCount: number;
    num2Learn: number;
    num2Test: number;
}

export const enum ActEnum {
    NOACT,
    STUDY_MODE,
    STUDY_NEXT,
    TEST_NEXT,
    TEST_MODE,
    FINISH,
}

export interface IRetGoStudyMode {
    num2Learn: number;
}

export interface IRetStudyNext {
    "score": string;
    "word": string;
    "phonetic": string;
    "audioURL": string;
    "dictURL": string;
    "curLearnIndex": number;
    "num2Learn": number;
}

export interface IRetGoTestMode {
    "action": number;
    "curCount": number;
    "testTimes": number;
    "num2Test": number;
}

export interface IRetTestNext {
    "audio1URL": string;
    "dict2URL": string;
    "curTestPos": number;
    "curTestNum": number;
}

export interface IRetCheckInput {
    "score": string;
    "action": ActEnum;
    "audioURL": string;
    "dictURL": string;
    "num2Learn": number;
    "curCount": number;
    "testTimes": number;
    "num2Test": number;
}

export interface IRetActWord {
    "action": ActEnum;
    "curCount": number;
    "testTimes": number;
    "num2Test": number;
}
