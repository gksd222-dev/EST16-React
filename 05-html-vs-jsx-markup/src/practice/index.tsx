
import type { JSX } from 'react/jsx-runtime';
import './practice.css';
import ProfileCard from './dataBinding/profileCard';



function Practice():JSX.Element {
  return (
    <div className="practice">
      <section>
        <h1>Practice</h1>
        <ProfileCard />
      </section>
    </div>
  )
}
export default Practice















