import Column from './components/Column';
import { TASKS } from './@types';

function KanBanBoard() {
  return (
    <section className="h-[82vh] flex flex-col justify-evenly items-stretch lg:flex-row lg:item-start gap-3 px-3">
      <Column status={TASKS.planned} />
      <Column status={TASKS.ongoing} />
      <Column status={TASKS.done} />
    </section>
  );
}

export default KanBanBoard;
