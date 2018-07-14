import * as React from 'react';

import { getNearbyStations } from 'data/geolocation';
import { getAdvisoriesForLines, getStationWithTimes } from 'data/stations';
import { ILineAdvisory, IStation } from 'models/models';

import LineAdvisories from 'components/LineAdvisories';
import Query, { IQueryResult } from 'components/Query';
import TimeTable from 'components/TimeTable';

interface IProps {
  path: string;
}

import styles from './styles.css';

class Home extends React.Component<IProps> {
  public render() {
    return (
      <div className={styles.Home}>
        <Query
          query={getNearbyStations(4)}
          renderWhenError={this.renderNoLocation}
          renderWhenLoading={
            <React.Fragment>
              <TimeTable.Skeleton />
              <TimeTable.Skeleton />
            </React.Fragment>
          }
        >
          {({ data }: IQueryResult<string[]>) =>
            data.map(stationId => this.renderTimeTable(stationId))
          }
        </Query>
        <div className={styles.credits}>
          <p className={styles.smaller}>
            Built with <span className={styles.love}>&lt;3</span> by{' '}
            <a href="https://wesley.so/" target="_blank">
              @WesleydeSouza
            </a>.
          </p>
          <p className={styles.smaller}>
            <a
              href="https://github.com/WesleydeSouza/subway-time"
              target="_blank"
            >
              Fork it on GitHub.
            </a>
          </p>
        </div>
      </div>
    );
  }

  public renderTimeTable(stationId: string) {
    return (
      <Query
        key={stationId}
        query={getStationWithTimes}
        parameters={{ stationId }}
        renderWhenError={
          <div className={styles.centralized}>
            Unable to retrieve time table.
          </div>
        }
        renderWhenLoading={<TimeTable.Skeleton />}
      >
        {({ data, lastUpdate, updateData }: IQueryResult<IStation>) => (
          <TimeTable
            lastUpdate={lastUpdate}
            station={data}
            advisoriesComponent={
              <Query
                query={getAdvisoriesForLines}
                parameters={{ lineIds: data.lineIds }}
              >
                {({ data: advisoryData }: IQueryResult<ILineAdvisory[]>) => (
                  <LineAdvisories advisories={advisoryData} />
                )}
              </Query>
            }
            updateData={updateData}
          />
        )}
      </Query>
    );
  }

  public renderNoLocation = () => {
    return (
      <div className={styles.error}>
        <div className={styles.errorMessage}>
          Unable to find nearby stations.<br />
          <br />
          Please allow location access.
        </div>
        <button
          className={styles.errorRetry}
          onClick={this.handleRetryClick}
          type="button"
        >
          Try again
        </button>
      </div>
    );
  };

  public handleRetryClick = () => {
    location.reload();
  };
}

export default Home;
