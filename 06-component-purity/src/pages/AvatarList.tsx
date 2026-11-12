import Avatar from "../components/Avatar";

function AvatarListPage(){
  // JSX
  return (
    <ul className="avatarList">
      <Avatar name="짱구" status="online" />
      <Avatar name="짱구" status="online" />
      <Avatar name="짱구" status="online" />
      <Avatar name="짱구" status="online" />
    </ul>
  );
}
export default AvatarListPage