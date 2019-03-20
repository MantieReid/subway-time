import { createState } from '~/lib/simple-state';

import { apiStations, apiStationPlatformsByStationId } from './api';

import { appActions } from '../app';

export interface IStation {
  id: string;
  name: string;
  lineIds: string[];
  latitude: number;
  longitude: number;
}

export interface IStationsById {
  [stationId: string]: IStation;
}

export interface IStationPlatform {
  lineId: string;
  directions: IStationPlatformDirection[];
}

export interface IStationPlatformsByStationId {
  [stationId: string]: IStationPlatform[];
}

export interface IStationPlatformDirection {
  name: string;
  times: IStationPlatformDirectionTime[];
}

export interface IStationPlatformDirectionTime {
  minutes: number | string;
  lastStationName: string;
}

export interface IStationState {
  currentStationId: string | null;
  platformsByStationId: IStationPlatformsByStationId | null;
  stationsById: IStationsById | null;
}

export const stationState = createState<IStationState>({
  currentStationId: null,
  platformsByStationId: null,
  stationsById: null,
});

const fetchStations = async () => {
  await appActions.loadingStarted();

  try {
    const apiStationsById = await apiStations();
    await stationState.set({
      stationsById: apiStationsById,
    });
  } catch (e) {
    await appActions.handleError(e);
  } finally {
    await appActions.loadingEnded();
  }
};

const fetchStationPlatformsByStationId = async (stationId: string) => {
  await appActions.loadingStarted();

  try {
    const platformsById: { [platformId: string]: IStationPlatform } = {};

    const platforms = await apiStationPlatformsByStationId(stationId);
    platforms.forEach(platform => {
      platformsById[platform.lineId] = platform;
    });

    const { platformsByStationId } = await stationState.get();
    await stationState.set({
      platformsByStationId: {
        ...platformsByStationId,
        [stationId]: platforms,
      },
    });
  } catch (e) {
    await appActions.handleError(e);
  } finally {
    await appActions.loadingEnded();
  }
};

export const stationActions = {
  fetchStations,
  fetchStationPlatformsByStationId,
};
