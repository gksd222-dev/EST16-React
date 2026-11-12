import type { MouseEvent } from "react";






function NavContents() {

  // 사이드 이펙트 (부수효과)
  // 얘네들은 컴포넌트 안에 있으면 안됨.
  // 사이드 이펙트를 처리할 수 있는 함수 안에 있는건 가능함
  // 이벤트 핸들러


  //선언형 프로그래밍
  const handleClickFirstLink = (e:MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const firstLink  = document.querySelector('[href="jsx-markup"]') as HTMLAnchorElement;
    firstLink.dataset.element = 'jsx-markup'
    console.log( firstLink );
  }


  return (
    <nav className="NavContents" aria-label="학습 주제 탐색">
      <a href="#jsx-markup" onClick={handleClickFirstLink}>JSX 마크업</a>
      <a href="#responding-to-events">이벤트 응답</a>
    </nav>
  )
  
}


export default NavContents




