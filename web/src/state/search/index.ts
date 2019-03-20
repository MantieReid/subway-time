import { createState } from '~/lib/simple-state';

import { stationState } from '../station';

export interface ISearchState {
  query: string | null;
  resultStationIds: string[] | null;
}

export const searchState = createState<ISearchState>({
  query: null,
  resultStationIds: null,
});

const search = async (query: string | null) => {
  const resultStationIds: string[] = [];

  if (!query) {
    searchState.set({
      query,
      resultStationIds,
    });
    return;
  }

  const { stationsById } = await stationState.get();
  if (!stationsById) {
    searchState.set({
      query,
      resultStationIds,
    });
    return;
  }

  const stations = Object.values(stationsById);

  if (query && query.length === 1) {
    const lineId = query.toUpperCase();
    stations.forEach(station => {
      if (!station.lineIds.includes(lineId)) {
        return;
      }

      resultStationIds.push(station.id);
    });
  } else if (query && query.length > 1) {
    const queryCleaned = query
      .replace(/[^a-z0-9\s]/gi, '')
      .replace(/\s+/g, '\\s+');
    const queryRegex = new RegExp(`(^|\\s+)${queryCleaned}`, 'i');
    stations.forEach(station => {
      if (!queryRegex.test(station.name)) {
        return;
      }

      resultStationIds.push(station.id);
    });
  }

  searchState.set({
    query,
    resultStationIds,
  });
};

export const searchActions = {
  search,
};
