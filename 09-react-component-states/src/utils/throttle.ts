// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle<T extends (...args: any[]) => void>(
  callback: T,
  timeout: number = 400
): (...args: Parameters<T>) => void {
  let isCalled = false;

  return (...args: Parameters<T>) => {
    if (!isCalled) {
      setTimeout(() => {
        callback(...args);
        isCalled = false;
      }, timeout);
      isCalled = true;
    }
  };
}
