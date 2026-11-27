import { GrFormDown, GrFormUp } from 'react-icons/gr';
import S from  './style.module.css';
import { memo, useMemo, useState } from 'react';
import tw from '@/utils/tw';
import CountButton_ from './CountButton_';
import CountDisplay_ from './CountDisplay_';
import useCounter from '@/hook/useCounter';

function Counter({className}:{className?:string}) {

  const { count, increment, decrement, step, isMaxDisabled, isMinDisabled } = useCounter();

  const incrementLabel = `${step} 증가`
  const decrementLabel = `${step} 감소`

  return (
    <div className={tw(S.component,className)}>
      <CountDisplay_ count={count} />

      <div role="group" className={S.group}>
        <CountButton_ 
          title={incrementLabel}
          aria-label={incrementLabel} 
          disabled={isMaxDisabled}
          onUpdate={increment}
        >
          {useMemo(()=> <GrFormUp />, [])}
        </CountButton_>

        <CountButton_ 
          title={decrementLabel}
          aria-label={decrementLabel} 
          disabled={isMinDisabled}
          onUpdate={decrement}
        >
          {useMemo(()=> <GrFormUp />, [])}
        </CountButton_>
      </div>
    </div>
  )
}

export default memo(Counter)