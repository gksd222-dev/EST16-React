import { useState } from "react";




type Status = 'success' | 'typing' | 'submitting';

// status가 submitting일 때 button과 textarea를 disabled 해주세요.

function Form() {

  // 상태를 선언하고 상태를 핸들러를 통해 변경

  // 현재 상태를 기억하기 위해서 useState를 사용함
  // answer : 입력한 값 -> 버튼, textarea 활성/비활성화
  // status : 지금 어떤 화면이야?

  const [answer,setAnswer] = useState('');
  const [error,setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<string>('typing');

  
  if(status === 'success'){
    return <h1>정답입니다~~!!</h1>;
  }

  // submit을 누르면 상태가 submitting으로 변경된다.
  // Loading.....
  // 성공 / 실패 화면 
  const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');

    try{
      await submitForm(answer);
      setStatus('success');
    }
    catch(err){
      setStatus('typing');
      if(err instanceof Error){
        setError(err)
      }
    }
  }
  // 선언형 프로그래밍
  // 이벤트 핸들러는 "상태만"만 바꿉니다. 화면은 React가 그려준다.
  const handleTextareaChange = (e:React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(e.target.value);
  }
  /* 오답을 입력하면 어떻게 될까????????????????? */
  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>오르미 캠프 퀴즈!</h2>
      <p>지금 오르미 캠프에서 가장 졸린 사람은?</p>
      <textarea 
        aria-label="정답 입력" 
        disabled={status === 'submitting'}
        onChange={handleTextareaChange}
       ></textarea>
      <hr />
      <button type="submit" disabled={
        answer.length === 0 ||
        status === 'submitting'
        }>Submit</button>
        {error !== null && <p style={{color:'red'}}>{error.message}</p>}
      {status === 'submitting' && <p>Loading....</p>}
    </form>
  )
}
export default Form;


const submitForm = (answer: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (answer.toLowerCase() === '김효경') {
        resolve('👍');
      } else {
        reject(new Error('땡! 너는 이미 정답을 알고있다.'));
      }
    }, 1500);
  });
};