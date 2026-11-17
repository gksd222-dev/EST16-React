import './NoteApp.css';
import { useState } from 'react';
import { getNoteList, type Note } from './api/getNote';
import NoteListPage from './pages/NoteListPage';
import { ROUTES } from './routes';
import NoteDetailPage from './pages/NoteDetailPage';
import NoteCreatePage from './pages/NoteCreatePage';

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

  // 파생 상태: 새 노트의 id값 
  const newNoteId = list.length + 1;

  switch (routeInfo.route) {
    case ROUTES.list:
      return <NoteListPage list={list} onChangeRoute={handleChangeRoute}/>
    case ROUTES.detail:
      return <NoteDetailPage noteId={routeInfo.noteId} onChangeRoute={handleChangeRoute}/>
    case ROUTES.create:
      return <NoteCreatePage onCreate={handleCreateNote} newNoteId={newNoteId} onChangeRoute={handleChangeRoute}/>
    case ROUTES.edit:
      return <div>edit page</div>
  }
}
export default NoteApp;