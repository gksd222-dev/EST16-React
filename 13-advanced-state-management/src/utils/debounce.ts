// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(
  callback: T,
  timeout = 10
) {
  let cleanup: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(cleanup);
    cleanup = setTimeout(() => callback(...args), timeout);
  };
}
