import Divider from "@/components/Divider";
import TaskManager from "@/miniApp/TaskManager/TaskManager";
import TaskManager_ from "@/miniApp/TaskManager/TaskManager_";

function TasksPage() {
  return (
    <>
      <title>할 일</title>

      <section id="page">
        <div className="learn">
          <h1>할 일</h1>
          <p>같은 할 일 목록을 Context + Reducer와 Zustand로 만들어 비교합니다.</p>

          <Divider />

          <h2 lang="en" className="uppercase">Task Manager</h2>
          <p>태스크 매니저 앱의 상태를 컨텍스트 + 리듀서를 사용해 관리합니다.</p>

          <TaskManager_ />

          <Divider />

          <h2 lang="en" className="uppercase">Task Manager</h2>
          <p>태스크 매니저 앱의 상태를 Zustand를 사용해 관리합니다.</p>

          <TaskManager />
        </div>
      </section>
    </>
  );
}

export default TasksPage;
