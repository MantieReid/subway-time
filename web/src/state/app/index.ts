import { createState } from '~/lib/simple-state';

export interface IAppState {
  loadingCounter: number;
}

export const appState = createState<IAppState>({
  loadingCounter: 0,
});

const handleError = async (error: Error) => {
  console.error(error);
};

const loadingStarted = async () => {
  const { loadingCounter } = await appState.get();
  await appState.set({
    loadingCounter: loadingCounter + 1,
  });
};

const loadingEnded = async () => {
  const { loadingCounter } = await appState.get();
  await appState.set({
    loadingCounter: loadingCounter - 1,
  });
};

export const appActions = {
  handleError,
  loadingStarted,
  loadingEnded,
};
