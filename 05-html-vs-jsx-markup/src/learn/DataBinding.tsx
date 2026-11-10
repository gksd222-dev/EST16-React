// template

import { getRandom } from "@/utils/getRandom";
import type { JSX } from "react/jsx-runtime"
// import { Fragment } from "react/jsx-runtime"



interface Props {
  statusMessages: StateMessage[];
}


function DataBinding({statusMessages}:Props): JSX.Element {

  const statusMessage =statusMessages[getRandom(statusMessages.length)];
  
  return (
    <>
      <dt>데이터 바인딩 (data binding)</dt>
      <dd>
        <p>상태 메시지(status message)를 연결해 화면에 출력합니다.</p>
        <span className="status">{statusMessage}</span>
      </dd>
    </>
  )
}
export default DataBinding