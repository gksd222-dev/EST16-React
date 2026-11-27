import KanBanBoard from "@/miniApp/KanbanBoard";

function KanbanBoardPage() {
  return (
    <>
      <title>칸반 보드</title>
      <meta
        name="description"
        content="칸반보드 앱은 Zustand로 상태를 관리합니다. 상태 관리 방법을 살펴봅시다."
      />

      <section id="page">
        <div className="learn">
          <h1>칸반 보드</h1>
          <p>칸반보드 앱은 Zustand로 상태를 관리합니다. 카드 추가 · 삭제 · 드래그 이동을 스토어 하나로 다룹니다.</p>
        </div>
        <KanBanBoard />
      </section>
    </>
  );
}

export default KanbanBoardPage;
