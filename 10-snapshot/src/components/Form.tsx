import { useState } from "react";




function getInitialForm(){

  console.log('복잡한 상태 계산중 . . .');
  return {
    title: '',
    content: '',
    createdAt: new Date().toISOString()
  }
}



function Form() {
  
  const [form, setForm] = useState(getInitialForm);
  
  const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    // form.title = e.target.value
    setForm({
      ...form,
      title: e.target.value
    })
  }
  
  return (
    <div>
      <input type="text" value={form.title} onChange={handleChange} placeholder="제목" aria-label="제목입력" />
      <p>작성일시: {form.createdAt}</p>
    </div>
  )
}
export default Form;
















