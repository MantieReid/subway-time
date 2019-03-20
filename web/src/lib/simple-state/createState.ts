import {
  IState,
  IStateHookObserverResult,
  IStateObserver,
  IStateObserverCallback,
  IStateObserverSelector,
} from './interfaces';
import { useEffect, useState } from 'react';

let isCallingObservers = false;

export const createState = <T>(initialState: T): IState<T> => {
  const data: T = initialState;
  const observers: (IStateObserver<T, any> | null)[] = [];
  let observerTimers: any = null;

  const get = (): T => {
    return data;
  };

  const set = async (state: { [P in keyof T]?: T[P] }): Promise<void> => {
    if (isCallingObservers) {
      throw new Error(`Not able to set while calling observers.`);
    }

    Object.assign(data, state);

    return new Promise(resolve => {
      resolve();

      scheduleObservers();
    });
  };

  const observe = <U>(
    selector: IStateObserverSelector<T, U>,
    callback: IStateObserverCallback<U>,
  ): (() => void) => {
    const observer: IStateObserver<T, U> = {
      selector,
      callback,
      lastSelectorResult: selector(data),
    };
    observers.push(observer);
    const observerIndex = observers.length - 1;
    return () => {
      if (!observers[observerIndex]) {
        console.warn(
          `No observer set on observerIndex`,
          observerIndex,
          initialState,
        );
      }
      observers[observerIndex] = null;
    };
  };

  const scheduleObservers = () => {
    if (observerTimers) {
      clearTimeout(observerTimers);
    }
    observerTimers = setTimeout(callObservers, 0);
  };

  const callObservers = () => {
    isCallingObservers = true;
    try {
      observers.forEach(observer => {
        if (!observer) {
          return;
        }
        const { callback, lastSelectorResult, selector } = observer;
        const selectorResult = selector(data);
        if (selectorResult !== lastSelectorResult) {
          observer.lastSelectorResult = selectorResult;
          callback(selectorResult);
        }
      });
    } catch (error) {
      throw error;
    } finally {
      isCallingObservers = false;
    }
  };

  const useObserver = <U>(
    selector: IStateObserverSelector<T, U>,
    dependencies: ReadonlyArray<any> = [],
  ): IStateHookObserverResult<U> => {
    const currentState = get();
    const initialValue = selector.call(null, currentState);

    const [data, setData] = useState<U>(initialValue);

    useEffect(
      () => observe(selector, (data: U) => setData(data)),
      dependencies,
    );

    return [data];
  };

  return { get, observe, set, useObserver };
};
