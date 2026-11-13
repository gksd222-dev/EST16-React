

const template = `
  <hr />
  <form id="form">
    <h2>이스트 캠프 퀴즈!</h2>
    <p>
      이스트 캠프에서 가장 잘생긴 사람은?
    </p>
    <textarea id="textarea"></textarea>
    <br />
    <button id="button" disabled>Submit</button>
    <p id="loading" style="display: none">Loading...</p>
    <p id="error" style="display: none; color: red;"></p>
  </form>
  <h1 id="success" style="display: none">정답입니다~~!</h1>
  <hr />
`

const app = document.getElementById('app');
app?.insertAdjacentHTML('beforeend',template);

const form = document.getElementById('form') as HTMLFormElement;
const textarea = document.getElementById('textarea') as HTMLTextAreaElement;
const button = document.getElementById('button') as HTMLButtonElement;
const loading = document.getElementById('loading') as HTMLParagraphElement;
const error = document.getElementById('error') as HTMLParagraphElement;
const success = document.getElementById('success') as HTMLHeadingElement;

const hide = (el:HTMLElement) => el.style.display = 'none';
const show = (el:HTMLElement) => el.style.display = 'block';
const enable = (el:HTMLElement & {disabled:boolean}) => el.disabled = false;
const disable = (el:HTMLElement & {disabled:boolean}) => el.disabled = true;



const submitForm = (answer:string):Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if(answer.toLowerCase() === '심선범'){
        resolve('👍');
      }else{
        reject(new Error('땡! 너는 이미 정답을 알고있다.'))
      }
    }, 1500);
  })
}





async function handleFormSubmit (e:SubmitEvent) {
  e.preventDefault();
  disable(textarea)
  disable(button)
  show(loading)
  hide(error)

  try{
    await submitForm(textarea.value);
    show(success)
    hide(form);
  }
  catch(err){
    show(error);
    if(err instanceof Error){
      error.textContent = err.message;
    }
  }
  finally{
    hide(loading);
    enable(textarea)
    enable(button)
  }
}

function handleTextChange(){
  if(textarea.value.length === 0){
    disable(button)
  }else{
    enable(button)
  }
}

textarea.addEventListener('input',handleTextChange)
form.addEventListener('submit',handleFormSubmit)