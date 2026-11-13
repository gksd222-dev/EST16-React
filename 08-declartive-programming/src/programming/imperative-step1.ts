// module programming

const container = document.getElementById('imperative-programming')!;

const checkbox = container?.querySelector(
  'input[type="checkbox"]'
) as HTMLInputElement;

const button = container.querySelector('button') as HTMLButtonElement;


// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).checkbox = checkbox;


function handleChange(e:Event){

  const { checked } = e.target as HTMLInputElement;
  
  if(checked){
    button.disabled = true;
    button.textContent = '비활성 상태'
    //
  }else{
    //
    button.disabled = false;
    button.textContent = '활성 상태'
  }
  
  
}



checkbox?.addEventListener('change',handleChange)