import { memo } from 'react';
import S from './style.module.css'

function CountDisplay({count}:{count:number}) {

  
  return (
    <output className={S.output}>{count}</output>
  )
}

export default memo(CountDisplay)