import { Link } from '@reach/router';
import * as React from 'react';

import LineId from '~/components/LineId';

import { IStation } from '~/state/station';

import styles from './styles.css';
import { ILinesById } from '~/state/line';

interface IProps {
  linesById: ILinesById;
  stations: IStation[];
  onClick?: () => void;
}

const SearchResults = ({ linesById, stations, onClick }: IProps) => (
  <ul className={styles.SearchResults}>
    {stations.map(station => (
      <li key={station.id} className={styles.station}>
        <Link
          className={styles.link}
          onClick={onClick}
          to={`/station/${station.id}`}
        >
          <div className={styles.lines}>
            {station.lineIds.map((lineId, index, lines) => (
              <LineId
                id={lineId}
                key={lineId}
                color={linesById[lineId] ? linesById[lineId].color : undefined}
                className={styles.lineId}
                style={{
                  zIndex: lines.length - index,
                }}
              />
            ))}
          </div>
          <div className={styles.name}>{station.name}</div>
        </Link>
      </li>
    ))}
  </ul>
);

export default SearchResults;
