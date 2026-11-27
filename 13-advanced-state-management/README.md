# 16. 고급 상태 관리 — 예열 스타터

라우터 · 레이아웃 · Tailwind · UI 마크업은 **모두 준비된 상태**입니다.
이번 시간에는 상태 관리 코드만 작성합니다.

```bash
npm i
npm run dev   # http://localhost:3000  (Node 20.19 이상)
```

## 페이지

| 메뉴 | 주소 | 내용 |
| --- | --- | --- |
| 카운터 | `/counter` | 커스텀 훅 · useReducer · Zustand 카운터를 나란히 비교 |
| 할 일 | `/tasks` | Context + Reducer · Zustand 할 일 목록을 나란히 비교 |
| 칸반보드 | `/kanbanboard` | 실전형 Zustand 스토어 + devtools |
| 심화 · Switch | `/switch` | 제어 · 비제어 훅을 useState → useReducer로 |

`pages/Counter`, `pages/Tasks`의 주석 처리된 섹션은 수업 중 해당 Part에서 주석을 풀어 화면에 붙입니다.

## 학생이 만드는 파일 / 채우는 자리

- 새로 만드는 파일: `hook/useCounter.ts`, `miniApp/CounterReducer/index.tsx`, `miniApp/TaskManager/@reducer.ts` · `@context.tsx` · `@store.ts`, `miniApp/Counter/@store.ts`, `miniApp/KanbanBoard/@store.ts`
- 채우는 자리: `TODO(Part N)` 주석 — VS Code에서 `TODO(Part` 로 검색

## 참고

- 시작 상태의 빈 자리(빈 함수, 아직 쓰지 않는 변수) 때문에 `tsconfig.app.json`의 `noUnusedLocals`/`noUnusedParameters`를 꺼 두었고, ESLint `no-unused-vars`는 경고로만 표시됩니다.
- 브라우저 확장: React DevTools("Highlight updates when components render" 켜기), Redux DevTools(칸반보드)
- 완성본: `../16-advanced-state-management`
