import gsap from 'gsap';
import S from './Home.module.css';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';


function Home() {


  const textRef = useRef<HTMLDivElement>(null);


  useGSAP(()=>{
    gsap.fromTo('h2, span',{
      y:50,
      opacity:0,
    },{
      y:0,
      opacity:1,
      stagger:0.2,
      duration:1,
      ease:'Power3.easeInOut'
    })
  }, {scope: textRef})
  

  return (
    <div className={S.container}>
      <div ref={textRef}>
        <h2> <strong> 예쁜 건 죄가 아니잖아요? </strong> </h2>
        <span> 하지만 카드값은 유죄입니다. </span>
      </div>
      <img src="https://framerusercontent.com/images/b7G2tciOtF1moIuVP1RhaGIQKKU.jpg" alt="" />
    </div>
  )

}
export default Home