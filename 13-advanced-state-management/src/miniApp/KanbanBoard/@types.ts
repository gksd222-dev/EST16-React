export const TASKS = {
  planned: 'PLANNED',
  ongoing: 'ONGOING',
  done: 'DONE',
} as const

export type TaskType = typeof TASKS[keyof typeof TASKS];

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskType;
}
