import type { RouteObject } from 'react-router';

export type AppRoute = Omit<RouteObject, 'children'> & {
  text?: string;
  display?: boolean;
  children?: AppRoute[];
}
