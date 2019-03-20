import React, { useState, useEffect } from 'react';

import NavigationBar from '~/components/NavigationBar';
import SearchResults from '~/components/SearchResults';

import { IStationsById, stationActions, stationState } from '~/state/station';
import { searchActions, searchState } from '~/state/search';
import { ILinesById, lineActions, lineState } from '~/state/line';

interface IProps {
  path?: string;
}

const Search = ({  }: IProps) => {
  const [linesById] = lineState.useObserver<ILinesById | null>(
    ({ linesById }) => linesById,
  );
  const [resultStationIds] = searchState.useObserver<string[] | null>(
    ({ resultStationIds }) => resultStationIds,
  );
  const [stationsById] = stationState.useObserver<IStationsById | null>(
    ({ stationsById }) => stationsById,
  );

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    searchActions.search(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (!linesById) {
      lineActions.fetchLines();
      stationActions.fetchStations();
    }
  }, []);

  if (!resultStationIds || !linesById || !stationsById) {
    return null;
  }

  const resultStations = resultStationIds.map(
    stationId => stationsById[stationId],
  );

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <>
      <NavigationBar
        onSearchChangeWithValue={setSearchTerm}
        onSearchFocusWithValue={setSearchTerm}
      />
      {resultStations.length ? (
        <SearchResults
          linesById={linesById}
          stations={resultStations}
          onClick={clearSearch}
        />
      ) : null}
    </>
  );
};

export default Search;
