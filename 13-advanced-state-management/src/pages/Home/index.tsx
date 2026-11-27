import AppLink from "@/components/AppLink";
import Divider from "@/components/Divider";
import { Link } from "react-router";

const roadmap = [
  { path: '/counter', title: '카운터', desc: 'Part 1 커스텀 훅 · Part 2 useReducer · Part 6~7 Zustand' },
  { path: '/tasks', title: '할 일', desc: 'Part 3~4 리듀서 + Context · Part 5 Context의 한계 · Part 8 Zustand로 비교' },
  { path: '/kanbanboard', title: '칸반보드', desc: 'Part 9 실전형 Zustand 스토어 + devtools' },
  { path: '/switch', title: '심화 · Switch', desc: 'Part 10 제어 · 비제어 훅을 useState → useReducer로' },
];

function Home() {
  return (
    <>
      <title>앱 글로벌 상태 관리 with Zustand</title>
      <meta
        name="description"
        content="커스텀 훅 → useReducer → Context → Zustand 순서로 같은 문제를 풀어보며 상태 관리 방식을 비교합니다."
      />

      <section id="page">
        <div className="learn">
          <h1>앱 글로벌 상태 관리 with Zustand</h1>
          <p>
            <AppLink href="https://zustand.docs.pmnd.rs/learn/getting-started/introduction" isExternal>
              Zustand
            </AppLink>{' '}
            라이브러리를 사용해 앱 또는 컴포넌트의 상태를 효과적으로 관리하는 방법을 학습합니다.
          </p>

          <Divider />

          <h2>오늘 쓰는 페이지</h2>
          <ul className="w-full max-w-md flex flex-col gap-2 mt-2">
            {roadmap.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="block p-3 rounded-md border border-indigo-100 bg-white hover:border-accent"
                >
                  <strong className="text-accent">{item.title}</strong>
                  <span className="block text-sm text-slate-600">{item.desc}</span>
                </Link>
              </li>
            ))}
          </ul>

          <Divider />

        </div>
      </section>
    </>
  );
}

export default Home;
