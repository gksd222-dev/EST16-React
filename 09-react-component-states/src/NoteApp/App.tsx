import './NoteApp.css';
import { useState } from 'react';
import { getNoteList, type Note } from './api/getNote';
import NoteListPage from './pages/NoteListPage';
import { ROUTES } from './routes';
import NoteDetailPage from './pages/NoteDetailPage';
import NoteCreatePage from './pages/NoteCreatePage';
import NoteEditPage from './pages/NoteEditPage';

/* 


                 ┌────────────── App (상태는 여기에만) ──────────────┐
                 │  list       ← useState(() => getNoteList())      │
                 │  routeInfo  ← { route, noteId }                  │
                 │  파생       selectedNote, newNoteId              │
                 │  함수       handleChangeRoute / Create / Edit / Delete │
                 └─────────────────────┬────────────────────────────┘
                                       │ switch (routeInfo.route)
       ┌──────────────────┬────────────┴─────┬───────────────────┐
       ▼                  ▼                  ▼                   ▼
 NoteListPage       NoteDetailPage     NoteCreatePage      NoteEditPage
  └ NoteList         ├ BackLink         ├ BackLink          ├ BackLink
   (클릭 → detail)    ├ PrintError       └ NoteForm(create)  └ NoteForm(edit)
  (작성 → create)    (수정 → edit)





*/


function NoteApp() {

  const [list, setList] = useState(()=> getNoteList());
  const [routeInfo, setRouteInfo] = useState<{
    route:string;
    noteId: number | null;
  }>({
    route:'list',
    noteId:null
  })

  const handleChangeRoute = (nextRoute:string, pickNoteId:number) => {
    // 어디 페이지로 갈건지 nextRoute
    // 현재 선택된 noteId 
    setRouteInfo({
      ...routeInfo,
      route: nextRoute,
      noteId: pickNoteId ? pickNoteId : routeInfo.noteId
    })
  }

  const handleCreateNote = (newNoteItem:Note) => {
    setList([...list,newNoteItem]);
  }

  //노트 수정 : id가 같은 노트만 새 객체로 변경한 이후 새로운 배열을 변환
  const handleEditNote = (willEditNote:Note)=>{
    const nextList = list.map((item)=>
      item.id === willEditNote.id ? willEditNote : item
    );
    setList(nextList);
  }


// 삭제 핸들러 만들기

// 핸들러 전달하기
  const handleDeleteNote = (willDeleteNoteId:number) => {
// array.filter를 사용해 선택된 id만 배열에서 제외
    const nextList = list.filter( (item)=> item.id !== willDeleteNoteId);    
// list 갱신
    setList(nextList);
  }


  // 파생 상태: 새 노트의 id값 
  // const newNoteId = list.length + 1;
  const newNoteId = Math.max(0, ...list.map((item)=>item.id)) + 1;
  


  const selectedNote = list.find((item)=> item.id === routeInfo.noteId) ?? null;

  switch (routeInfo.route) {
    case ROUTES.list:
      return <NoteListPage list={list} onChangeRoute={handleChangeRoute}/>
    case ROUTES.detail:
      return <NoteDetailPage note={selectedNote} noteId={routeInfo.noteId} onChangeRoute={handleChangeRoute}/>
    case ROUTES.create:
      return <NoteCreatePage onCreate={handleCreateNote} newNoteId={newNoteId} onChangeRoute={handleChangeRoute}/>
    case ROUTES.edit:
      return <NoteEditPage
       onDelete={handleDeleteNote}
       onEdit={handleEditNote}
       noteId={routeInfo.noteId}
       note={selectedNote}
       onChangeRoute={handleChangeRoute}/>
  }
}
export default NoteApp;