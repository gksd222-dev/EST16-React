import { PiPushPinFill, PiPushPinLight } from 'react-icons/pi';
import tw from '@/utils/tw';
import type { Task } from './@types';
import { useTask } from './@context';


function PinnedTaskList() {

  const {
    pinnedTaskList,
    methods: { togglePin, setTask }
  } = useTask();


  const handleSetTask = (taskId:string, isCompleted:boolean) => {
    setTask(taskId, isCompleted);
  };

  const handleTogglePin = (taskId:string) => {
    togglePin(taskId);
  };

  console.log('Pinned render');
  

  return (
    <ul className='flex flex-col gap-2' >
      {pinnedTaskList.map((task) => {
        return (
          <li key={task.id} className="flex justify-between gap-1.5">
            <label
              className={tw('text-2xl',task.isCompleted ? 'line-through' : '')}
            >
              <input
                type="checkbox"
                defaultChecked={task.isCompleted}
                onChange={(e) => handleSetTask(task.id, e.target.checked)}
              />{' '}
              {task.content}
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={() => handleTogglePin(task.id)}>
                {task.isPin ? <PiPushPinFill /> : <PiPushPinLight />}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}


export default PinnedTaskList;