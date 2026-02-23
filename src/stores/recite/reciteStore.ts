import { defineStore } from "pinia";
import {
    requestListLevels,
    requestListUsers,
    requestGetUserLevelMap,
    requestStart2Recite,
    requestGoStudyMode,
    requestStudyNext,
    requestGoTestMode,
    requestTestNext,
    requestCheckInput,
    requestForget,
    requestChop,
    requestSaveProgress,
} from "@/service/recite";
import type { IReciteState, ActEnum } from "./types";
import type { ICountDetail} from "./types";
import type { IRetGoStudyMode, IRetStudyNext} from "./types";
import type { IRetGoTestMode, IRetTestNext} from "./types";
import type { IRetCheckInput, IRetActWord} from "./types";
import type { User, Level, UserLevelMap } from "@/types/recite";

export const useReciteStore = defineStore("reciteState", () => {
    const reciteState: IReciteState = {
        user: 'Youchee',
        level: "IELTS-CET6",
        dictId: 1,
        audioId: 1,
        curDictId: 1,
        curWord: "",
        num2Learn: 0,
        num2Test: 0
    };

    async function listLevels(): Promise<Level []>{
        const result = await requestListLevels();
        const levelValues = result.data as string [];

        const levelList: Level [] = [];
        for (const levelValue of levelValues) {
            levelList.push({value: levelValue, label: levelValue});
        }

        return levelList;
    }

    async function listUsers(): Promise<User []>{
        const result = await requestListUsers();
        const usernames = result.data as string [];

        const userList: User [] = [];
        for (const username of usernames) {
            userList.push({name: username, desc: username});
        }
        return userList;
    }

    async function getUserLevelMap(): Promise<UserLevelMap>{
        const result = await requestGetUserLevelMap();
        const levels = result.data as UserLevelMap;
        return levels;
    }

    async function start2Recite(): Promise<
        [number, number, number, number]
    > {
        const result = await requestStart2Recite();
        // console.debug(`start2Recite = ${JSON.stringify(result)}`);
        console.debug(`start2Recite: ${result.code}, ${result.data}, ${result.msg}`);
        // const countData = JSON.parse(result.data) as ICountDetail;
        const countData = result.data as ICountDetail;
        console.debug(`countData: ${countData}`);
        const allCount = countData.allCount;
        const newCount = countData.newCount;
        const fnshdCount = countData.fnshdCount;
        const inProgressCount = countData.inProgressCount;
        reciteState.num2Learn = countData.num2Learn;
        reciteState.num2Test = countData.num2Test;

        return [allCount, newCount, fnshdCount, inProgressCount];
    }

    async function goStudyMode(): Promise<number> {
        const result = await requestGoStudyMode();
        // console.debug(`goStudyMode = ${JSON.stringify(result)}`);
        console.debug(`goStudyMode: ${result.code}, ${result.data}, ${result.msg}`);
        // const ret = JSON.parse(result.data) as IRetGoStudyMode;
        const ret = result.data as IRetGoStudyMode;
        const num2Learn = ret.num2Learn;
        return num2Learn;
    }

    function buildURL(url: string){
        const baseURL = import.meta.env.VITE_BASE_URL;
        return `${baseURL}/${url}`;
    }

    async function studyNext(): Promise<
            [string, string, string, string, string, number, number]> {
        const result = await requestStudyNext();
        // console.debug(`studyNext = ${JSON.stringify(result)}`);
        console.debug(`studyNext: ${result.code}, ${result.data}, ${result.msg}`);
        // const ret = JSON.parse(result.data) as IRetStudyNext;
        const ret = result.data as IRetStudyNext;
        const score = ret.score;
        const word = ret.word;
        const phonetic = ret.phonetic;

        const dictURL = buildURL(ret.dictURL);
        console.debug(`dictURL = ${dictURL}`);
        const audioURL = buildURL(ret.audioURL);
        console.debug(`audioURL = ${audioURL}`);

        const curLearnIndex = ret.curLearnIndex;
        const num2Learn = ret.num2Learn;

        return [
            score,
            word,
            phonetic,
            audioURL,
            dictURL,
            curLearnIndex,
            num2Learn,
        ];
    }

    async function goTestMode(): Promise<[number, number, number, number]> {
        const result = await requestGoTestMode();
        // console.debug(`goTestMode = ${JSON.stringify(result)}`);
        console.debug(`goTestMode: ${result.code}, ${result.data}, ${result.msg}`);
        // const ret = JSON.parse(result.data) as IRetGoTestMode;
        const ret = result.data as IRetGoTestMode;
        const action = ret.action;
        const curCount = ret.curCount;
        const testTimes = ret.testTimes;
        const num2Test = ret.num2Test;
        return [action, curCount, testTimes, num2Test];
    }

    async function testNext(): Promise<[string, string, number, number]> {
        const result = await requestTestNext();
        // console.debug(`testNext = ${JSON.stringify(result)}`);
        console.debug(`testNext: ${result.code}, ${result.data}, ${result.msg}`);
        // const ret = JSON.parse(result.data) as IRetTestNext;
        const ret = result.data as IRetTestNext;
        const audio1URL = buildURL(ret.audio1URL);
        const dict2URL = buildURL(ret.dict2URL);
        const curTestPos = ret.curTestPos;
        const curTestNum = ret.curTestNum;
        return [audio1URL, dict2URL, curTestPos, curTestNum];
    }

    async function checkInput(word: string): Promise<
        [string, ActEnum, string, string, number, number, number, number]
    > {
        const result = await requestCheckInput(word);
        // console.debug(`checkInput = ${JSON.stringify(result)}`);
        console.debug(`checkInput: ${result.code}, ${result.data}, ${result.msg}`);
        // const ret = JSON.parse(result.data) as IRetCheckInput;
        const ret = result.data as IRetCheckInput;
        const score = ret.score;
        const action = ret.action;
        const audioURL = buildURL(ret.audioURL);
        const dictURL = buildURL(ret.dictURL);
        const num2Learn = ret.num2Learn;
        const curCount = ret.curCount;
        const testTimes = ret.testTimes;
        const num2Test = ret.num2Test;
        return [
            score,
            action,
            audioURL,
            dictURL,
            num2Learn,
            curCount,
            testTimes,
            num2Test,
        ];
    }

    async function forget(): Promise<[ActEnum, number, number, number]> {
        const result = await requestForget();
        // console.debug(`forget = ${JSON.stringify(result)}`);
        console.debug(`forget: ${result.code}, ${result.data}, ${result.msg}`);
        const ret = result.data as IRetActWord;
        const action = ret.action;
        const curCount = ret.curCount;
        const testTimes = ret.testTimes;
        const num2Test = ret.num2Test;
        return [action, curCount, testTimes, num2Test];
    }

    async function chop(): Promise<[ActEnum, number, number, number]> {
        const result = await requestChop();
        // console.debug(`chop = ${JSON.stringify(result)}`);
        console.debug(`chop: ${result.code}, ${result.data}, ${result.msg}`);
        // const ret = JSON.parse(result.data) as IRetActWord;
        const ret = result.data as IRetActWord;
        const action = ret.action;
        const curCount = ret.curCount;
        const testTimes = ret.testTimes;
        const num2Test = ret.num2Test;
        return [action, curCount, testTimes, num2Test];
    }

    async function saveProgress(): Promise<void> {
        const result = await requestSaveProgress();
        // console.debug(`saveProgress = ${JSON.stringify(result)}`);
        console.debug(`saveProgress: ${result.code}, ${result.data}, ${result.msg}`);
    }

    return {
        listLevels,
        listUsers,
        getUserLevelMap,
        reciteState,
        start2Recite,
        goStudyMode,
        studyNext,
        goTestMode,
        testNext,
        checkInput,
        forget,
        chop,
        saveProgress,
    };
});
