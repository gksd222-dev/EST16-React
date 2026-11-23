import { useEffect, useRef, useState } from "react"
import Child from "./Child";




function Parent() {
  const [messages, setMessages] = useState<string[]>([
    '다했어?',
    '넘어가도 돼?',
    '나중에 안 보여준다?'
  ]);

  const addMessage = () => {
    setMessages((prev)=> [...prev, `새 메시지 ${prev.length + 1}`])
  }

  // const bottomRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{

    //해당 요소가 보이도록 스크롤 가능한 조상들을 전부 움직임.
    
    const list = listRef.current;
    if(!list) return;

    // 메시지 박스만 스크롤 scrollTo 스크롤의 어디 지점까지 이동을 시킬까
    // elem.scrollHeight => 스크롤의 전체 영역
    list.scrollTo({top: list.scrollHeight, behavior:'smooth'});
    // bottomRef.current?.scrollIntoView({behavior:'smooth'})

    // ref가 가리키는 대상이 맨 아래 div이냐 아니면 스크롤 박스냐

  },[messages])

  return (
    <div>
      <h2>채팅방</h2>
      <div 
        ref={listRef}
        style={{
          height:"200px",
          overflowY:'auto',
          border:'1px solid #ccc',
          padding:'10px'
        }}>
        {
          messages.map((msg,idx)=>
            <Child key={idx} message={msg}/>
          )
        }
        {/* <div ref={bottomRef}></div> */}
      </div>
      <button type="button" onClick={addMessage}>메시지 보내기</button>
    </div>
  )
}
export default Parent