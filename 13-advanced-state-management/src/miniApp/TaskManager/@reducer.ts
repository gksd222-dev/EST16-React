import type { Task } from "./@types";

export type State = Task[];

const ACTION_TYPE = {
  TOGGLE_PIN:'핀 토글',
  SET_TASK:'테스크 토글',
  DELETE_TASK:'테스크 삭제',
  ADD_TASK:'테스크 추가',
}as const;




export type TogglePinAction = {
  type: typeof ACTION_TYPE.TOGGLE_PIN;
  payload: string; 
}
export const togglePin = (taskId:string):TogglePinAction => ({
  type:ACTION_TYPE.TOGGLE_PIN,
  payload: taskId
})



export type SetTaskAction = {
  type: typeof ACTION_TYPE.SET_TASK;
  payload: {taskId:string; isCompleted:boolean} 
}
export const setTask = (taskId:string, isCompleted:boolean):SetTaskAction => ({
  type:ACTION_TYPE.SET_TASK,
  payload:{taskId, isCompleted}
})

export type DeleteTaskAction = {
  type: typeof ACTION_TYPE.DELETE_TASK;
  payload: string; // deleteId
};
export const deleteTask = (deleteId:string):DeleteTaskAction => ({
  type: ACTION_TYPE.DELETE_TASK,
  payload: deleteId,
});

 
export type AddTaskAction = {
  type: typeof ACTION_TYPE.ADD_TASK;
  payload: string; // nextStep
};
 
export const addTask = (nextStep:string) : AddTaskAction => ({
  type: ACTION_TYPE.ADD_TASK,
  payload: nextStep,
});




export type Action = 
  | TogglePinAction
  | SetTaskAction
  | DeleteTaskAction
  | AddTaskAction;

export default function reducer(state:State, action:Action):State{
  switch (action.type){
    case ACTION_TYPE.TOGGLE_PIN : {
      const taskId = action.payload;
      
      const nextState = state.map((item)=>{
        if(item.id === taskId){
          const nextTask = { ...item, isPin: !item.isPin};
          return nextTask;
        }else{
          return item;
        }
      })
      return nextState;
    }
    case ACTION_TYPE.SET_TASK : {
      const { taskId, isCompleted } = action.payload;
      const nextState = state.map((item)=>{
        if(item.id === taskId){
          const nextTask = {...item, isCompleted};
          return nextTask;
        }else{
          return item;
        }
      })
      return nextState;
    }
    case ACTION_TYPE.DELETE_TASK: {
      const deleteId = action.payload;
      const nextState = state.filter((item) => item.id !== deleteId);
      return nextState;
    }
    case ACTION_TYPE.ADD_TASK: {
      const newTask = {
        id: crypto.randomUUID(),
        content: action.payload,
        isCompleted: false,
        isPin: false,
      };
 
      const nextState = [newTask, ...state];
 
      return nextState;
    }
    default: {
      return state;
    }
  }
}