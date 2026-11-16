
import type {CSSProperties} from "react"

interface Props {
  userCount: number;
  totalUserCount: number;
}

function UserListCount({userCount, totalUserCount}:Props) {
  
  const ratio = totalUserCount > 0 ? userCount / totalUserCount : 0
  
  
  return (
    <div className="UserListCount">
      <span className="text">
        <span>검색 결과</span>
        <span data-testid="user-list-count">
          {userCount} / <b>{totalUserCount}</b>
        </span>
      </span>
      <div className="bar">
        <span style={{"--ratio":ratio} as CSSProperties}></span>
      </div>
    </div>
  )
}
export default UserListCount