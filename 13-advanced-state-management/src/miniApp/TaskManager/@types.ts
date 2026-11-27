export type Task = {
  id: string;
  content: string;
  isCompleted: boolean;
  isPin: boolean;
};

//       테스크데이터

export const INITIAL_TASKS: Task[] = [
  {
    id: '374f637e-d27f-4aa3-acb4-a76b76a31d51',
    content: 'Context + Reducer',
    isCompleted: false,
    isPin: false,
  },
  {
    id: 'a1ddb5c6-f4aa-4c9c-968d-4c0750e5d705',
    content: 'Zustand',
    isCompleted: false,
    isPin: false,
  },
];
