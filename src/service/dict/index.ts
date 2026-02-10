import NetRquest from "../index";
// import axios from "axios";

interface IDataType<T = any> {
    message: string;
    data: T;
    status: string;
}

// const api = axios.create({
//     baseURL: "/api", // 固定指向代理前缀
//     timeout: 10000,
//     withCredentials: false, // 开发环境关闭凭据，避免跨域干扰
// });

export function requestDictsInfo() {
  return NetRquest.get<IDataType>({
    // url: "/dicts",
    url: "/dicts/",
  });
}

export function requestQueryWord(word: string, dictId: number) {
  console.log(`/dicts/${dictId}/${word}/`);
  return NetRquest.get<IDataType>({
    // url: `/dicts/${dictId}/${word}`,
    url: `/dicts/${dictId}/${word}/`,
  });
}
