// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number = 400
): (...args: Parameters<T>) => void {
  let timerId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}



/* Parameters type ---------------------------- */

type Fn = (a: string, b: number) => void;
// [수정] 학습용 타입 예시들이 미사용으로 tsc(noUnusedLocals)/ESLint 에러 → export 하여 빌드 에러 해소 (아래 Result, api, FetchDataResult, getUser, User 동일)
export type Params = Parameters<Fn>; // [a: string, b: number]



debounce((msg: string) => console.log(msg));

/* 
→ 여기서 T는 (msg: string) => void

→ Parameters<T>는 [msg: string]

→ 반환되는 함수도 (...args: [msg: string]) => void가 됨
→ 즉, 원래 함수와 똑같은 인자 시그니처로 안전하게 호출 가능
*/







/* ReturnType --------------------------------- */

type Add = (a: number, b: number) => number;
export type Result = ReturnType<Add>; // number


export const api = {
  fetchData() {
    return { data: [1, 2, 3] };
  }
};

export type FetchDataResult = ReturnType<typeof api.fetchData>;
// { data: number[] }



export function getUser() {
  return {
    id: 1,
    name: '선범',
    age: 20
  };
}

export type User = ReturnType<typeof getUser>;

// 위는 아래와 같음
// type User = {
//   id: number;
//   name: string;
//   age: number;
// };
