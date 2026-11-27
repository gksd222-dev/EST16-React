import Divider from "@/components/Divider";
import Switcher from "@/miniApp/Switcher/Switch";
import { useState } from "react";

function SwitchPage() {
  const [dark, setDark] = useState(false);

  return (
    <>
      <title>심화 · Switch</title>

      <section id="page">
        <div className="learn">
          <h1>심화 · Switch</h1>
          <p>제어 · 비제어를 모두 지원하는 훅을 만들고, 안쪽만 useReducer로 바꿔 봅니다.</p>

          <Divider />

          <h2 lang="en" className="uppercase">Switcher</h2>
          <p>위: 부모가 조종하는 스위치(제어) / 아래: 혼자 켜지고 꺼지는 스위치(비제어)</p>

          <Switcher size="lg" checked={dark} onChange={setDark} />
          <p className="uppercase">{dark ? 'dark' : 'light'}</p>

          <Switcher defaultChecked />
        </div>
      </section>
    </>
  );
}

export default SwitchPage;
