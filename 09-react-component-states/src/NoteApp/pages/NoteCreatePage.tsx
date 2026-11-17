import type { Note } from "../api/getNote";
import BackLink from "../components/BackLink";
import NoteForm from "../components/NoteForm";
import { ROUTES } from "../routes";

interface Props{
  onChangeRoute:(nextRoute:string,pickNoteId:number)=>void;
  onCreate: (newNoteItem:Note) => void;
  newNoteId: number;
}


function NoteCreatePage({ onChangeRoute, onCreate, newNoteId }:Props) {

  const handleBackLink = () => onChangeRoute(ROUTES.list,0)

  return (
    <div className="NoteCreatePage">
      <BackLink onChangeRoute={handleBackLink} />
      <NoteForm onCreate={onCreate} onBackLink={handleBackLink} newNoteId={newNoteId}/>
    </div>
  )
}
export default NoteCreatePage