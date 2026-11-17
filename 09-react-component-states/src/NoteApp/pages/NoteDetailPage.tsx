import { getNodeItem } from '../api/getNote'
import BackLink from '../components/BackLink';
import PrintError from '../components/PrintError';
import { ROUTES } from '../routes';
import './NoteDetailPage.css'


interface Props {
  noteId: number | null;
  onChangeRoute:(nextRoute:string,pickNoteId:number) => void;
}

function NoteDetailPage({noteId, onChangeRoute }:Props) {

  // noteId = null;

  if( !noteId ) return <PrintError> 이런! 노트를 찾을 수 없습니다. 🚫 </PrintError>

  const note = getNodeItem(noteId);


  const createMarkup = () => {
    if(!note) return;
    return {__html : note.content}
  }

  const handleBackToList = () => onChangeRoute(ROUTES.list,0)

  

  return (
    <div className='NoteDetailPage'>
      <BackLink onChangeRoute={handleBackToList} />
      {!note && <PrintError> 이런! 노트를 찾을 수 없습니다. 🚫 </PrintError>}
      {
        note && (
          <>
            <h2>{note.title}</h2>
            <span>{note.expand?.user.name}</span>
            <div dangerouslySetInnerHTML={createMarkup()} />
          </>
        )
      }
    </div>
  )
}
export default NoteDetailPage