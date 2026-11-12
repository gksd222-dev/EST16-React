import Avatar from "../components/Avatar";

function AvatarListPage(){
  // JSX
  return (
    <ul className="avatarList">
      <li>
        <Avatar name="짱구" status="online" />
      </li>
      <li>
        <Avatar name="짱구" status="online" />
      </li>
      <li>
        <Avatar name="짱구" status="online" />
      </li>
      <li>
        <Avatar name="짱구" status="online" />
      </li>
    </ul>
  );
}
export default AvatarListPage