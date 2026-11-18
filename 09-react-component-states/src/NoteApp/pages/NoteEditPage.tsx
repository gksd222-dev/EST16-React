import type { Note } from "../api/getNote";
import BackLink from "../components/BackLink";
import NoteForm from "../components/NoteForm";
import { ROUTES } from "../routes";


interface Props{
  noteId: number | null;
  note:Note | null;
  onChangeRoute: (nextRoute:string, pickNoteId:number) => void
  onEdit:(willEditNote:Note)=> void;
  onDelete:(willDeleteNoteId:number)=> void;
}

function NoteEditPage({onDelete, noteId, note, onChangeRoute, onEdit}:Props) {
  
  if(!noteId) return;

  const handleBackLink = () => onChangeRoute(ROUTES.list, 0);

  return (
    <div className="NoteEditPage">
      <BackLink onChangeRoute={handleBackLink} />
      {
        note && (
          <>
            <h2>노트 편집</h2>
            <NoteForm
             onDelete={onDelete}
             mode='edit'
             note={note}
             onEdit={onEdit}
             onBackLink={handleBackLink}

             />
          </>
        )
      }
    </div>
  )
}
export default NoteEditPage


