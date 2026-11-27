import tw from "@/utils/tw"
import UnpinnedTaskList from "./UnpinnedTaskList"
import PinnedTaskList from "./PinnedTaskList"

function TaskManager() {
  return (
      <div lang="en"
        className={tw(
          'w-72 flex flex-col gap-2 p-5 border border-solid border-accent rounded text-accent'
        )}
      >
        <PinnedTaskList />
        <UnpinnedTaskList />
        
      </div>
  )
}
export default TaskManager