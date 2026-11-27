import { useMemo, useRef, useState } from 'react';
import { debounce } from '@/utils/debounce';
import { TASKS, type Task as TaskItem, type TaskType } from '../@types';
import tw from '@/utils/tw';
import Task from './Task';
import Dialog from './Dialog';

interface InputContents {
  title: string;
  description: string;
};

interface Props {
  status: TaskType;
};

const initialInputContents: InputContents = {
  title: '',
  description: '',
};

function Column({ status }: Props) {

  const tasks: TaskItem[] = [];
  const draggedTask = null as TaskItem | null;
  const setDraggedTask = (_id: string) => {};
  const moveTask = (_id: string, _status: TaskType) => {};
  const addTask = (_title: string, _description: string, _status: TaskType) => {};

  const [title, colorClassName] = getStatusTitleAndColor(status);

  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [open, setOpen] = useState(false);
  const [drag, setDrag] = useState(false);
  const [inputContents, setInputContents] = useState<InputContents>(initialInputContents);

  const handleOpen = () => {
    dialogRef.current?.showModal();
    setOpen(true);
  };

  const handleClose = () => {
    dialogRef.current?.close();
    setOpen(false);
    setInputContents(initialInputContents);
  };

  const handleInputContent = useMemo(
    () =>
      debounce(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          const { name, value } = e.target;
          setInputContents((prev) => ({
            ...prev,
            [name]: value,
          }));
        }
      ),
    []
  );

  const handleSaveTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addTask(inputContents.title, inputContents.description, status);
    setInputContents(initialInputContents);
    handleClose();
  };

  return (
    <>
      <article
        onDragOver={(e: React.DragEvent<HTMLElement>) => {
          e.dataTransfer.dropEffect = 'move';
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={(e: React.DragEvent<HTMLElement>) => {
          e.dataTransfer.dropEffect = 'none';
          e.preventDefault();
          setDrag(false);
        }}
        onDrop={() => {
          if (!draggedTask) return;
          moveTask(draggedTask.id, status);
          setDraggedTask('');
          setDrag(false);
        }}
        className={tw('border-8 h-[inherit] border-slate-300 bg-indigo-50/3 text-slate-700 flex-1 flex flex-col gap-4 p-5 transition-all duration-200',drag ? 'border-slate-300 border-dashed' : '')}
      >
        <div className="flex justify-between items-center mb-2">
          <h2 className={tw('text-xl font-medium',colorClassName)}>
            {title} ({tasks.length})
          </h2>
          <button
            type="button"
            aria-label={`${title} 추가`}
            title={`${title} 추가`}
            onClick={handleOpen}
            className="text-xl font-bold leading-[0] p-0 bg-slate-50/60 w-8 h-8 rounded-full grid place-content-center shadow-md hover:bg-white transition-colors duration-200"
          >
            +
          </button>
        </div>
        {tasks.map((task) => (
          <Task key={task.id} id={task.id} />
        ))}
      </article>

      <Dialog
        key={status}
        ref={dialogRef}
        open={open}
        label={title}
        state={inputContents}
        color={colorClassName}
        onInput={handleInputContent}
        onSave={handleSaveTask}
        onClose={handleClose}
      />
    </>
  );
}

function getStatusTitleAndColor( status: TaskType ): readonly [title: string, colorClassName: string] {
  switch (status) {
    case TASKS.planned:
      return ['계획', 'text-planned'] as const;
    case TASKS.ongoing:
      return ['진행중', 'text-ongoing'] as const;
    case TASKS.done:
      return ['완료', 'text-done'] as const;
  }
}

export default Column;
