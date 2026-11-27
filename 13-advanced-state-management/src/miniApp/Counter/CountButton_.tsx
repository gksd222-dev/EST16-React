
import { memo } from 'react';
import S from './style.module.css'





function CountButton({children,onUpdate,...restProps}:Omit<React.ButtonHTMLAttributes<HTMLButtonElement>,'type'> & {
  onUpdate: ()=>void;
}) {



  return (
    <button
      type="button"
      className={S.button}
      onClick={onUpdate}
      {...restProps}
    >
      {children}
    </button>
  )
}
export default memo(CountButton)