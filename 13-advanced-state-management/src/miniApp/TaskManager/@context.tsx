import React, { createContext, useContext, useMemo, useReducer } from 'react';
import taskReducer, {
  addTask,
  deleteTask,
  setTask,
  togglePin,
} from './@reducer';
import { INITIAL_TASKS, type Task } from './@types';

// 컨텍스트에서 노출할 메서드 타입
type TaskMethods = {
  addTask: (nextStep: string) => void;
  deleteTask: (deleteId: string) => void;
  setTask: (taskId: string, isCompleted: boolean) => void;
  togglePin: (taskId: string) => void;
};

// 컨텍스트 값 타입
type TaskContextValue = {
  pinnedTaskList: Task[];
  unpinnedTaskList: Task[];
  methods: TaskMethods;
} | null;

// 컨텍스트 생성
const TaskContext = createContext<TaskContextValue>(null);
TaskContext.displayName = 'TaskContext';

// Provider
export function TaskProvider(props: React.PropsWithChildren) {
  // 상태
  const [taskList, dispatch] = useReducer(taskReducer, INITIAL_TASKS);

  // 이벤트 핸들러(메서드)
  const taskMethods = useMemo<TaskMethods>(() => {
    const handleAddTask = (nextStep: string) => dispatch(addTask(nextStep));
    const handleDeleteTask = (deleteId: string) => dispatch(deleteTask(deleteId));
    const handleTogglePin = (taskId: string) => dispatch(togglePin(taskId));
    const handleSetTask = (taskId: string, isCompleted: boolean) =>
      dispatch(setTask(taskId, isCompleted));
 
 
    return {
      addTask: handleAddTask,
      deleteTask: handleDeleteTask,
      setTask: handleSetTask,
      togglePin: handleTogglePin,
    };
  }, []); 
  // 파생된 상태

  const { pinnedTaskList, unpinnedTaskList } = useMemo(() => {
    return {
      pinnedTaskList: taskList.filter((task) => task.isPin),
      unpinnedTaskList: taskList.filter((task) => !task.isPin),
    };
  }, [taskList]);
 
  const contextValue = useMemo(
    () => ({ pinnedTaskList, unpinnedTaskList, methods: taskMethods }),
    [pinnedTaskList, unpinnedTaskList, taskMethods]
  );

  return (
    <TaskContext value={ contextValue } {...props} />
  );
}


// eslint-disable-next-line react-refresh/only-export-components
export const useTask = () => {
  const contextValue = useContext(TaskContext);
  if (!contextValue) {
    throw new Error('useTask 훅은 TaskProvider 내부에서만 사용해야 합니다.');
  }
  return contextValue;
};