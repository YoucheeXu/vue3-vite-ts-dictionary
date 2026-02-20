import NetRequest from "../index";
// import axios from "axios";

interface IDataType<T = any> {
    code: number;
    data: T;
    msg: string;
}

// const api = axios.create({
//     baseURL: "/api", // 固定指向代理前缀
//     timeout: 10000,
//     withCredentials: false, // 开发环境关闭凭据，避免跨域干扰
// });

export function requestDictsInfo() {
  return NetRequest.get<IDataType>({
    // url: "/dicts",
    url: "/dicts/",
  });
}

export function requestQueryWord(word: string, dictId: number) {
  console.log(`/dicts/${dictId}/${word}/`);
  return NetRequest.get<IDataType>({
    // url: `/dicts/${dictId}/${word}`,
    url: `/dicts/${dictId}/${word}/`,
  });
}

export function requestUploadFile(uploadUrl: string, formData: FormData){
  return NetRequest.post<IDataType>({
    url: uploadUrl,
    data: formData, // Pass FormData as request body
    // Critical: Set headers for multipart/form-data (adjust based on your NetRequest encapsulation)
    headers: {
      'Content-Type': 'multipart/form-data', // Let browser auto-add boundary (do NOT hardcode boundary)
      // If your NetRequest has a default Content-Type, override it here
    }
  });
}

export function requestAddLevel(word: string, level: string) {
  const patchUrl = `/words/${word}/add/level/${level}`;
  return NetRequest.patch<IDataType>({
    url: patchUrl,
  });
}
