import { memo } from 'react';

function Divider() {
  return (
    <hr className="my-8 border-t-[0.5px] border-solid border-t-accent w-1/4 max-w-md" />
  );
}

export default memo(Divider);
