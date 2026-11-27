import { create } from 'zustand';

type Store = {
  count: number;
  step: number;
  max: number;
  min: number;
  increment: ()=> void;
  decrement: ()=> void;
  reset: ()=> void;
  setStep: (newStep:number) => void;
}

export const useCountStore = create<Store>()((set, _get, store)=> {
  
  const increment = () => 
    set(({count, step, max})=> {
      let nextCount = count + step;
      if (nextCount >= max) nextCount = max;
      return {count:nextCount}
    })

  const decrement = () => 
    set(({count, step, min})=> {
      let nextCount = count - step;
      if (nextCount <= min) nextCount = min;
      return {count:nextCount}
    })

  const setStep = (newStep:number) => {
    set({ step : newStep });
  }

  const reset = () => set(store.getInitialState())

  return {
    step:1,
    min:0,
    max:10,
    count:0,
    increment,
    decrement,
    reset,
    setStep
  }
})