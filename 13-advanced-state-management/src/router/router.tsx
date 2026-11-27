import Home from "@/pages/Home";
import Root from "@/pages/Root";
import CounterPage from "@/pages/Counter";
import TasksPage from "@/pages/Tasks";
import SwitchPage from "@/pages/Switch";
import Spinner from "@/components/Spinner";
import { createBrowserRouter } from "react-router";
import { configRoutes } from '@/utils/configRoutes';
import { getNavigationItems } from "@/utils/getNavigationItems";
import type { AppRoute } from "@/@types/global";

const navigation: AppRoute[] = [
  { text: '홈', path: '', Component: Home },
  { text: '카운터', path: 'counter', Component: CounterPage },
  { text: '할 일', path: 'tasks', Component: TasksPage },
  {
    text: '칸반보드',
    path: 'kanbanboard',
    HydrateFallback: () => <Spinner />,
    lazy: async () => {
      const mod = await import('@/pages/KanbanBoard');
      return { Component: mod.default };
    },
  },
  { text: '심화 · Switch', path: 'switch', Component: SwitchPage },
];

export const routes = [
  {
    path: '/',
    Component: Root,
    children: configRoutes(navigation),
  },
];

const router = createBrowserRouter(routes, {
  basename: import.meta.env.BASE_URL,
});

export default router;

export const navigationItems = getNavigationItems(navigation);
