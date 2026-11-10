
import './profileCard.css';
import { type JSX } from 'react';
import { profile, todayQuotes } from './data';
import { getRandom } from '@/utils/getRandom';

function ProfileCard(): JSX.Element {
  // TODO 1. 구조 분해 할당으로 profile 에서 필요한 값을 꺼내 보세요.
  //         (name, nickname, birthYear, avatar, github, themeColor, job, skills, isOpenToWork)

  const {name, nickname, birthYear, avatar, github,themeColor,job,skills,isOpenToWork } =profile;

  // TODO 2. 올해 연도(new Date().getFullYear())와 birthYear 로 나이를 계산하세요.
  const age = new Date().getFullYear() - birthYear

  // TODO 3. getRandom() 으로 todayQuotes 중 하나를 무작위로 고르세요.
  //         (힌트: DataBinding.tsx 에서 수정된 부분을 참고하세요.)
  const quote = todayQuotes[getRandom(todayQuotes.length)];

  return (
    // TODO 4. style 속성에 객체를 바인딩해 카드 테두리 색을 themeColor 로 지정하세요.
    //         style={{ borderColor: ??? }}
  <article className="profileCard" style={{ borderColor: themeColor }}>
      {/* TODO 5. 속성 바인딩: src 에는 avatar, alt 에는 "김리액트 프로필 사진" 이 되도록 이름을 연결하세요. */}
      <img className="avatar" src={avatar} alt={`${name} 프로필 사진`} />
      
      {/* TODO 6. 텍스트 바인딩: 이름과 @닉네임을 출력하세요. 이름과 닉네임 사이에는 공백이 한 칸 있어야 합니다. */}
      <h2>
        {name} <small>@{nickname}</small>
      </h2>

      {/* TODO 7. 중첩 객체 바인딩: "프론트엔드 개발자 · 프로그래머스" 형태로 출력하세요. */}
      <p className="job">{job.title} · {job.company}</p>

      <dl className="info">
        <div>
          <dt>나이</dt>
          {/* TODO 8. 표현식 바인딩: "26세" 처럼 나이 뒤에 '세' 를 붙여 출력하세요. */}
          <dd>{age}세</dd>
        </div>
        <div>
          <dt>GitHub</dt>
          {/* TODO 9. href 와 링크 텍스트에 github 주소를 바인딩하세요. 새 탭에서 열리도록 target, rel 도 지정합니다. */}
          <dd>
            <a href={github} target='_blank' rel="noopener noreferrer">{github}</a>
          </dd>
        </div>
        <div>
          <dt>기술 스택</dt>
          {/* TODO 10. 배열 메서드 결과 바인딩: skills 를 ' / ' 로 연결한 문자열과 개수를 출력하세요.
                       예) HTML / CSS / JavaScript / TypeScript / React (5개) */}
          <dd>{skills.join(' | ')} ({skills.length}개)</dd>
        </div>
        <div>
          <dt>구직 중</dt>
          {/* TODO 11. isOpenToWork 를 그대로 {isOpenToWork} 로 출력하면 화면에 무엇이 보이나요?
                       확인한 뒤 String() 또는 삼항 연산자로 'true' / '예' 처럼 보이도록 고쳐 보세요. */}
          <dd>
            {isOpenToWork ? 'yes' : 'no'}
            {/* {isOpenToWork ?? 'yes'} */}
          </dd>
        </div>
      </dl>

      {/* TODO 12. 오늘의 한마디(quote)를 출력하세요. 새로고침할 때마다 바뀌면 성공! */}
      <blockquote className="quote">{quote}</blockquote>
    </article>
  );
}

export default ProfileCard;


