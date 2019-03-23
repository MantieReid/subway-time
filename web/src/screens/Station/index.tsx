import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';

import {
  ILineAdvisory,
  ILinesById,
  lineActions,
  lineState,
} from '~/state/line';
import {
  IStation,
  IStationPlatform,
  stationState,
  stationActions,
} from '~/state/station';

import TimeTable from '~/components/TimeTable';

interface IProps {
  path?: string;
  stationId?: string;
}

const Station = ({ stationId }: IProps) => {
  if (!stationId) {
    return null;
  }

  const [linesById] = lineState.useObserver<ILinesById | null>(
    ({ linesById }) => linesById,
  );

  const [station] = stationState.useObserver<IStation | null>(
    ({ stationsById }) =>
      stationsById && stationsById[stationId] ? stationsById[stationId] : null,
    [stationId],
  );
  const [platforms] = stationState.useObserver<IStationPlatform[] | null>(
    ({ platformsByStationId }) =>
      platformsByStationId ? platformsByStationId[stationId] : null,
    [stationId],
  );

  const [advisories] = lineState.useObserver<ILineAdvisory[]>(
    ({ lineAdvisoriesByLineId }) => {
      if (!station || !lineAdvisoriesByLineId) {
        return [];
      }

      const advisories: ILineAdvisory[] = [];
      station.lineIds.forEach(lineId => {
        if (lineAdvisoriesByLineId[lineId]) {
          advisories.push(...lineAdvisoriesByLineId[lineId]);
        }
      });
      return advisories;
    },
    [station],
  );

  const fetchAdvisories = () => {
    if (!station) {
      return;
    }

    const { lineIds } = station;
    console.log(station);
    lineIds.forEach(lineId => {
      lineActions.fetchLineAdvisories(lineId);
    });
  };

  const fetchStationPlatforms = () => {
    stationActions.fetchStationPlatformsByStationId(stationId);
  };

  const reload = () => {
    fetchStationPlatforms();
    fetchAdvisories();
  };

  useEffect(() => {
    fetchStationPlatforms();
  }, [stationId]);

  useEffect(() => {
    fetchAdvisories();
  }, [station]);

  if (!linesById || !station || !platforms) {
    return <div>Loading or error.</div>;
  }

  return (
    <>
      <Helmet>
        <title>{station.name}</title>
      </Helmet>
      <TimeTable
        advisories={advisories}
        lastUpdate={0}
        linesById={linesById}
        station={station}
        platforms={platforms}
        updateData={reload}
      />
    </>
  );
};

export default Station;
