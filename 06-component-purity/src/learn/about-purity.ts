



function truncateText(text:string, limit:number = 100):string{
  if(text.length > limit){
    return text.slice(0,limit) + '···'
  }
  return text;
}



const testText = 'a'.repeat(100);


console.log(truncateText(testText, 10));
console.log(truncateText(testText, 10));




function square(n :number):number{
  return n * n
}

console.log(square(5))
console.log(square(5))





function sum(arr:number[]):number{
  return arr.reduce((acc,val)=> acc + val,0)
}

const nums = [1,2,3];
const nums2 = [1,2,3];

console.log(sum(nums))
console.log(sum(nums2))


// eslint-disable-next-line prefer-const
let multiplier = 2;

function multiply(n:number):number{
  return n * multiplier;
}

console.log( multiply(3) );

multiplier = 3;
console.log( multiply(3) );

// 비순수함수
// 내부의 콘솔로그 때문에 비순수 함수이다
// 순수 함수의 조건 동일입력 -> 동일출력 -> 하나의 일을 처리 해야함

// side-effect는 정해진 곳에서 쓰자 ..!

function greet(name: string): string{
  console.log(`hello ${name}`); // side-effect 부수효과
  return `hello ${name}`
}

// 컴포넌트안에서 콘솔로그 쓰면 안되나?
// 됩니다 -> 원래는 안됨 -> 근데 왜? -> 리액트가 이거는 허용해줌


console.log( greet('선범') );
console.log( greet('선범') );



/* 
대표적인 side-effect는 뭐가 있을까?

1. DOM 조작 ( document.getElementById, document.querySelector )

2. 브라우저 API 호출 (setTimeout, setInterval)

3. 로컬 스토리지 접근 / 세션 스토리지 / indexDB / Cookie

4. 콘솔 출력 ( 예외 )

5. 도구 사용 (Redux, Zustand를 사용한 외부 접근)

6. 서버 요청(fetch, Axios)
*/

async function fetchUserInfo(userId:string){

  try{
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
    if(!response.ok) throw new Error('유저 정보를 가져오지 못했습니다.');

    const user = await response.json();

    console.log('유저 정보', user);
    
    const userEl = document.getElementById('user-info');
    if(userEl){
      userEl.textContent = `이름 : ${user.name}, 이메일 : ${user.email}`
    }
  }
  catch(err){

    if(err instanceof Error){
      console.error( err.message );
    }
  }
  
}

fetchUserInfo('3')















































