import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useGeolocation } from 'react-use';
import { GeoLocationSensorState } from 'react-use/lib/useGeolocation';

import {
  lineState,
  ILineAdvisoryByLineId,
  lineActions,
  ILinesById,
} from '~/state/line';
import { sortStationsByProximity } from '~/lib/sortStationsByProximity';
import {
  IStation,
  stationState,
  IStationPlatformsByStationId,
  stationActions,
} from '~/state/station';

import TimeTable from '~/components/TimeTable';

interface IProps {
  path: string;
}

import styles from './styles.css';

const Home = (_props: IProps) => {
  // FIXME: remove type forcing if https://github.com/streamich/react-use/pull/171 is released
  const {
    latitude,
    longitude,
  } = (useGeolocation() as any) as GeoLocationSensorState;

  const [linesById] = lineState.useObserver<ILinesById | null>(
    ({ linesById }) => linesById,
  );

  const [stations] = stationState.useObserver<IStation[] | null>(
    ({ stationsById }) => (stationsById ? Object.values(stationsById) : null),
  );

  const [
    platformsByStationId,
  ] = stationState.useObserver<IStationPlatformsByStationId | null>(
    ({ platformsByStationId }) => platformsByStationId,
  );

  const [
    lineAdvisoriesByLineId,
  ] = lineState.useObserver<ILineAdvisoryByLineId | null>(
    ({ lineAdvisoriesByLineId }) => lineAdvisoriesByLineId,
  );

  const [sortedStations, setSortedStations] = useState<IStation[]>([]);
  const [sortedStationIds, setSortedStationIds] = useState<string[]>([]);
  const [lineIds, setLineIds] = useState<string[]>([]);

  const fetchAdvisories = (lineIds: string[]) => {
    lineIds.forEach(lineId => {
      lineActions.fetchLineAdvisories(lineId);
    });
  };

  const fetchStationPlatforms = (stationIds: string[]) => {
    stationIds.forEach(stationId => {
      stationActions.fetchStationPlatformsByStationId(stationId);
    });
  };

  const reload = () => {
    fetchStationPlatforms(sortedStationIds);
    fetchAdvisories(lineIds);
  };

  useEffect(() => {
    if (!stations || !latitude || !longitude) {
      return;
    }

    const localSortedStations = sortStationsByProximity(
      stations,
      latitude,
      longitude,
    ).slice(0, 5);
    setSortedStations(localSortedStations);
    setSortedStationIds(localSortedStations.map(station => station.id));

    setLineIds([
      ...new Set(localSortedStations.map(station => station.lineIds).flat()),
    ]);
  }, [stations, latitude, longitude]);

  useEffect(() => {
    fetchStationPlatforms(sortedStationIds);
    fetchAdvisories(lineIds);
  }, [sortedStationIds.join(), lineIds.join()]);

  if (
    !stations ||
    !latitude ||
    !longitude ||
    !lineAdvisoriesByLineId ||
    !platformsByStationId ||
    !linesById
  ) {
    return <div>Loading or error.</div>;
  }

  return (
    <>
      <Helmet>
        <title>SubwayTi.me</title>
      </Helmet>
      <div className={styles.Home}>
        {sortedStations
          .filter(station => platformsByStationId[station.id])
          .map(station => (
            <TimeTable
              advisories={station.lineIds
                .map(lineId => lineAdvisoriesByLineId[lineId])
                .filter(Boolean)
                .flat()}
              key={station.id}
              lastUpdate={0}
              linesById={linesById}
              station={station}
              platforms={platformsByStationId[station.id]}
              updateData={reload}
            />
          ))}
        {/* <Query
        query={getNearbyStations(4)}
        renderWhenError={renderNoLocation}
        renderWhenLoading={
          <React.Fragment>
            <TimeTable.Skeleton />
            <TimeTable.Skeleton />
          </React.Fragment>
        }
      >
        {({ data }: IQueryResult<string[]>) =>
          data.map(stationId => renderTimeTable(stationId))
        }
      </Query> */}
        <div className={styles.credits}>
          <p className={styles.smaller}>
            Built with <span className={styles.love}>&lt;3</span> by{' '}
            <a href="https://wes.dev/" target="_blank">
              @WesSouza
            </a>
            .
          </p>
          <p className={styles.smaller}>
            <a href="https://github.com/WesSouza/subway-time" target="_blank">
              Source code available on GitHub.
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default Home;
