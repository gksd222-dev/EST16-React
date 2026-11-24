import useUserContext from "@/hook/useUserContext";
import { useTheme } from "./ThemeContext";

function GrandChild() {

  // react 18+
  // const ctx = useContext(UserContext);

  // react 19+
  // use() 컨텍스트도 받고 promise도 받음 (then이랑 비슷한 뭐시기)
  // const ctx = use(delayP());
  
  // const ctx = use(UserContext);
  // if(!ctx) return;
  // const { username } = ctx;
  
  const {username} = useUserContext()
  
  const {theme, toggleTheme} = useTheme();


  return (
    <div style={{
      background: theme.colors.background,
      color: theme.colors.text,
      padding: theme.spacing.md
    }}>
      <h4>바뀐다44444</h4>
      <p>안녕하세요, <strong>{username}</strong>님!</p>
      <button type="button" onClick={toggleTheme}>Change Theme</button>
    </div>
  )
}
export default GrandChild