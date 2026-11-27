import tw from "@/utils/tw"
import { TaskProvider } from "./@context"
import PinnedTaskList from "./PinnedTaskList_"
import UnpinnedTaskList from "./UnpinnedTaskList_"


function TaskManager() {

  return (
    <TaskProvider>
      <div lang="en"
        className={tw(
          'w-72 flex flex-col gap-2 p-5 border border-solid border-accent rounded text-accent'
        )}
      >
        <PinnedTaskList/>
        <UnpinnedTaskList />
      </div>
    </TaskProvider>
  )
}

export default TaskManager