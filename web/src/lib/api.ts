import subwayLinesPath from '~/data/subway-lines.json';
import subwayStationsPath from '~/data/subway-stations.json';

export const Endpoints = {
  Lines: subwayLinesPath,
  LineAdvisories: '/api/getAdvisoryDetail/:lineId',
  Stations: subwayStationsPath,
  StationTrainTimes: '/api/getTime/:lineId/:stationId',
};

export const get = async <T>(
  url: string,
  params: { [k: string]: string } = {},
): Promise<T> => {
  const parsedUrl = url.replace(
    /:([^\/]+)/g,
    (_, key: string) => params[key] || '',
  );
  const result = await fetch(parsedUrl);
  return await result.json();
};
