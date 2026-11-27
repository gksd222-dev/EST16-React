import { PiPushPinFill, PiPushPinLight } from 'react-icons/pi';
import { RxCross1 } from 'react-icons/rx';
import tw from '@/utils/tw';
import type { Task } from './@types';
import { useTaskStore, useUnpinnedTasks } from './@store';
import { useShallow } from 'zustand/shallow';
import { deleteTask, setTask, togglePin } from './@reducer';

function UnpinnedTaskList() {

  // const unpinnedTaskList: Task[] = [];
  // const deleteTask = (_deleteId: string) => {};
  // const togglePin = (_taskId: string) => {};
  // const setTask = (_taskId: string, _isCompleted: boolean) => {};

  // const tasks = useTaskStore( s => s.tasks);
  // const unpinnedTaskList = tasks.filter( t => !t.isPin);

  const unpinnedTaskList = useUnpinnedTasks();
  // const deleteTask = useTaskStore( s => s.deleteTask);
  // const togglePin = useTaskStore( s => s.togglePin);
  // const setTask = useTaskStore( s => s.setTask);

  const {togglePin, setTask, deleteTask} = useTaskStore(useShallow((s)=>({
    togglePin:s.togglePin,
    setTask:s.setTask,
    deleteTask:s.deleteTask
  })))

  console.log('[zustand] unpinned 렌더')



  const handleSetTask = (taskId:string, isCompleted:boolean) => {
    setTask(taskId, isCompleted);
  };

  const handleTogglePin = (taskId:string) => {
    togglePin(taskId);
  };

  const handleDeleteTask = (deleteId:string) => {
    deleteTask(deleteId);
  };

  return (
    <ul className='flex flex-col gap-6'>
      {unpinnedTaskList.map((task) => (
        <li key={task.id} className="flex justify-between gap-1.5">
          <label
            className={tw('flex gap-1', task.isCompleted && 'line-through')}
          >
            <input
              type="checkbox"
              className="accent-accent"
              defaultChecked={task.isCompleted}
              onChange={(e) => handleSetTask(task.id, e.target.checked)}
            />{' '}
            {task.content}
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={() => handleTogglePin(task.id)}>
              {task.isPin ? <PiPushPinFill /> : <PiPushPinLight />}
            </button>
            <button type="button" onClick={() => handleDeleteTask(task.id)}>
              <RxCross1 />
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
export default UnpinnedTaskList