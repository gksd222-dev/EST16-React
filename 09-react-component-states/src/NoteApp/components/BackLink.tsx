import './BackLink.css';

interface Props {
  onChangeRoute: ()=> void;
}

function BackLink({onChangeRoute}:Props) {

  
  const handleBackToList = (e:React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onChangeRoute();
  }


  return (
    <a href="#back" className="BackLink" onClick={handleBackToList} aria-label="목록으로 돌아가기">
      <svg aria-hidden="true" width="16px" height="16px" viewBox="0 0 24 24" strokeWidth={1} fill="none">
        <path
          d="M21 12L3 12M3 12L11.5 3.5M3 12L11.5 20.5"
          stroke="#fff"
          strokeWidth={1}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  )
}
export default BackLink