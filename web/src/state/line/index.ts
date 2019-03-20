import { createState } from '~/lib/simple-state';

import { apiAdvisoriesByLineId, apiLines } from './api';

import { appActions } from '../app';

export interface ILine {
  id: string;
  color: string;
}

export interface ILineAdvisory {
  id: string;
  html: string;
  reason: string;
  summary: string;
}

export interface ILineAdvisoryByLineId {
  [lineId: string]: ILineAdvisory[];
}

export interface ILinesById {
  [lineId: string]: ILine;
}

export interface ILineState {
  lineAdvisoriesByLineId: ILineAdvisoryByLineId | null;
  linesById: ILinesById | null;
}

export const lineState = createState<ILineState>({
  lineAdvisoriesByLineId: null,
  linesById: null,
});

const fetchLineAdvisories = async (lineId: string) => {
  await appActions.loadingStarted();

  try {
    const lineAdvisories = await apiAdvisoriesByLineId(lineId);

    const { lineAdvisoriesByLineId } = await lineState.get();
    await lineState.set({
      lineAdvisoriesByLineId: {
        ...lineAdvisoriesByLineId,
        [lineId]: lineAdvisories,
      },
    });
  } catch (e) {
    await appActions.handleError(e);
  } finally {
    await appActions.loadingEnded();
  }
};

const fetchLines = async () => {
  await appActions.loadingStarted();

  try {
    const linesById: { [lineId: string]: ILine } = {};

    const lines = await apiLines();
    lines.forEach(line => {
      linesById[line.id] = line;
    });

    await lineState.set({
      linesById,
    });
  } catch (e) {
    await appActions.handleError(e);
  } finally {
    await appActions.loadingEnded();
  }
};

export const lineActions = {
  fetchLineAdvisories,
  fetchLines,
};
