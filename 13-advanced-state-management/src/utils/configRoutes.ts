import type { AppRoute } from '@/@types/global';
import type {
  RouteObject,
  IndexRouteObject,
  NonIndexRouteObject,
} from 'react-router';

export function configRoutes(navigation: AppRoute[]): RouteObject[] {
  return navigation.map((item) => {
    const { children, ...routeProps } = item;

    const isIndex = routeProps.path === '' || routeProps.path === '/';

    let route: RouteObject;

    if (isIndex) {
      const { path: _omit, ...rest } = routeProps;
      route = { ...rest, index: true } as IndexRouteObject;
    } else {
      route = routeProps as NonIndexRouteObject;
    }

    if (children && children.length > 0) {
      route.children = configRoutes(children);
    }

    return route;
  });
}

