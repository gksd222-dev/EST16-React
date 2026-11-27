import { create } from "zustand";
import { INITIAL_TASKS, type Task } from "./@types";
import { useShallow } from "zustand/shallow";
import { persist } from 'zustand/middleware';

type TaskState = {
  tasks: Task[];
  addTask: (content:string) => void;
  deleteTask: (id:string) => void;
  togglePin: (id:string) => void;
  setTask: (id:string, isCompleted:boolean) => void;
  reset: () => void;
}
export const useTaskStore = create<TaskState>()(
  persist(
    (set,_get,store)=> ({
      tasks: INITIAL_TASKS,
      addTask:(content)=> 
        set((state)=>({
          tasks: [
            {
              id: crypto.randomUUID(),
              content,
              isCompleted:false,
              isPin:false
            },
            ...state.tasks
          ]
        })),
      deleteTask:(id)=> 
        set((state)=>({
          tasks: state.tasks.filter( (t) => t.id !== id )
        })),
      togglePin: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, isPin: !t.isPin } : t
          ),
        })),
      setTask:(id, isCompleted)=> 
        set((state)=>({
          tasks: state.tasks.map((t)=>
              t.id === id ? {...t, isCompleted} : t
          )
        })),
      reset:()=> set(store.getInitialState),
    })
  , {name:'task-store'})
)

export const usePinnedTasks = ()=> useTaskStore(useShallow((s) => s.tasks.filter((t) => t.isPin)))
export const useUnpinnedTasks = () => useTaskStore(useShallow((s) => s.tasks.filter((t) => !t.isPin)));