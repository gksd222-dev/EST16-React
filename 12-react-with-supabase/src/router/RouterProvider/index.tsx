// context/RouterProvider.tsx
import {
  Fragment,
  createContext,
  useLayoutEffect,
  useCallback,
  useState,
  useMemo,
  type ReactNode,
  type ReactElement,
} from "react";
import NotFound from "./NotFound";

export interface RouteItem {
  path: string;
  title: string;
  element: ReactElement;
}

interface RouterContextType {
  currentPath: string;
  setHistoryRoute: (to: string) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const RouterContext = createContext<RouterContextType | null>(null);

interface RouterProviderProps {
  routes: RouteItem[];
  navigation?: ReactNode;
}

export function RouterProvider({ routes, navigation }: RouterProviderProps) {
  const [routeElement, setRouteElement] = useState<ReactNode>(null);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [navKey, setNavKey] = useState(0);

  const setHistoryRoute = useCallback(
    (to: string) => {
      const routeInfo = routes.find(
        ({ path }) => path === to || `/${path}` === to
      );

      if (routeInfo) {
        document.title = routeInfo.title;
        setRouteElement(routeInfo.element);
      } else {
        setRouteElement(<NotFound />);
      }

      setCurrentPath(to); // ✅ 현재 경로 업데이트
      setNavKey((k) => k + 1);
    },
    [routes]
  );

  useLayoutEffect(() => {
    const { pathname } = window.location;

    const handler = () => setHistoryRoute(window.location.pathname);

    window.addEventListener("popstate", handler);
    setHistoryRoute(pathname);

    return () => {
      window.removeEventListener("popstate", handler);
    };
  }, [setHistoryRoute]);

  const value = useMemo(
    () => ({
      setHistoryRoute,
      currentPath,
    }),
    [setHistoryRoute, currentPath]
  );

  return (
    <RouterContext value={value}>
      <Fragment key={navKey}>{navigation}</Fragment>
      {routeElement}
    </RouterContext>
  );
}

export default RouterProvider;