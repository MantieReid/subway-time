export interface IState<T> {
  get(): T;
  observe<U>(
    selector: IStateObserverSelector<T, U>,
    callback: IStateObserverCallback<U>,
  ): () => void;
  set(state: { [P in keyof T]?: T[P] }): Promise<void>;
  useObserver<U>(
    selector: IStateObserverSelector<T, U>,
    dependencies?: ReadonlyArray<any>,
  ): IStateHookObserverResult<U>;
}

export type IStateObserverCallback<T> = (selectorResult: T) => void;

export type IStateObserverSelector<T, U> = (state: T) => U;

export type IStateHookObserverResult<T> = [T];

export interface IStateObserver<T, U> {
  callback: IStateObserverCallback<U>;
  lastSelectorResult?: U;
  selector: IStateObserverSelector<T, U>;
}
