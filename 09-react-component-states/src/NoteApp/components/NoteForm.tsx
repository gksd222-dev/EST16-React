import { useId, useState } from 'react';
import './NoteForm.css';
import { getUser, getUserList } from '../api/getUser';
import type { Note } from '../api/getNote';
import {convertHTMLToText, convertTextToHTMLString } from '@/utils/convertTextToHTMLString';


interface FormData {
  title:string;
  content:string;
  userId:number;
}

type FormEvent = React.ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>

// 컴포넌트 밖에서 호출 : 랜더링마다 다시 부를 필요가 없기 때문이다.
const userList = getUserList();


interface Props{
  onBackLink:()=> void;
  newNoteId?: number;
  mode: 'create' | 'edit';
  note?: Note;
  onCreate?: (newNoteItem:Note) => void;
  onEdit: (willEditNote:Note) => void;
    onDelete:(willDeleteNoteId:number)=> void;
}

function NoteForm({onDelete, onCreate, onBackLink, newNoteId, mode, note, onEdit}:Props) {

  const titleId = useId();
  const contentId = useId();
  const userId = useId();

  // 입력 칸 여러 개를 관리 -> 객체 하나로 상태 관리
  const [formData, setFormData] = useState<FormData>(()=>{
    
    //edit 모드에서 객체의 값을 설정
    if(mode === 'edit' && note){
      return {
        title: note.title,
        content: convertHTMLToText(note.content),
        userId: note.userId
      }      
    }


    return {
      title: '',
      content: '',
      userId: 0
    }


  });

  const isCreateMode = mode.includes('create');
  

  // title input에 글자를 입력하면 formData가 업데이트가 될 수 있도록 만들어주세요
  // - 업데이트 핸들러 함수 -> immutable data를 업데이트 
  // - 핸들러 함수 바인딩
  
  const handleUpdateFormData = (e:FormEvent) => {
    
    const {name, value} = e.target;
    const nextFormData = {
      ...formData,
      [name]: value
    }
    // computed property
    setFormData(nextFormData);
    console.log( formData );

    
  }

  const handleCreateNote = (e: React.FormEvent<HTMLFormElement>) => {
    
    e.preventDefault();

    const { title, content, userId } = formData;

    const newUserId = Number(userId)
    const user = getUser(newUserId);

    

    if(!user) return; // 작성자를 고르지 않으면 리턴
    if(!newUserId || !newNoteId) return; 
    
    const newNote = {
      id: newNoteId,
      title: title.trim(),
      content: convertTextToHTMLString(content),
      userId: newUserId,
      createdAt:'',
      updatedAt:'',
      expand:{user}
    }

    onCreate?.(newNote)
    onBackLink(); //목록으로 되돌아가기
  }

  // handleCreateNote 핸들러 함수 만들기
  // form에 핸들러 연결
  // handleCreateNote 안에서
  //  -> formData에서 필요한 값을 구조분해
  //  -> user의 항목 1개 가져오기 
  //  -> newNote 객체 만들기
  //          -> content는 covertTextToHTML
  //  -> 객체 값 조립
  //  -> onCreate에 완성된 객체 전달
  //  -> 목록으로 되돌아가기 

  const handleEdit = (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if(note && onEdit){
      const willEditNote = {
        ...note,
        title:formData.title.trim(),
        content:convertTextToHTMLString(formData.content),
        userId: Number(formData.userId)
      }

      onEdit(willEditNote);
      onBackLink();
    }
  }

  const handleDelete = () => {

    if(note && onDelete){
      onDelete(note.id);
      onBackLink();
    }

  }

  return (
    // reset 버튼은 DOM만 비움 -> 상태도 비워야 화면이 초기화가 됨
    <form
     className="NoteForm"
     onSubmit={isCreateMode ? handleCreateNote : handleEdit}
     onReset={()=> setFormData({title:'',content:'',userId:0})}>

      <div className="formControl">
        <label htmlFor={titleId}>제목</label>
        <input type="text" id={titleId} name="title" value={formData.title} onChange={handleUpdateFormData} />
      </div>

      <div className="formControl">
        <label htmlFor={contentId}>내용</label>
        <textarea id={contentId} name="content" value={formData.content} onChange={handleUpdateFormData} />
      </div>

      {
        isCreateMode && (
          <div className="formControl">
            <label htmlFor={userId}>작성자</label>
            <select
              name="userId"
              id={userId}
              value={formData.userId}
              onChange={handleUpdateFormData}
            >
              <option value={0}>작성자 선택</option>
              {
                userList.map((user)=>(
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))
              }
            </select>
          </div>
        )
      }

      <div className="buttonGroup">
        <button type="submit">{isCreateMode ? '추가' : '수정'}</button>
        {isCreateMode ? <button type="reset">초기화</button> : <button type="button" onClick={handleDelete}>삭제</button>}
      </div>

    </form>
  )
}

export default NoteForm