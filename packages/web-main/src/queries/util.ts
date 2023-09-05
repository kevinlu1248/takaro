import { MetadataOutput } from '@takaro/apiclient';
import debug from 'util';

const debugLog = debug('hasNextPage');

export function hasNextPage(pageInfo: MetadataOutput, pageIndex: number) {
  debugLog(`Function called with pageInfo: ${JSON.stringify(pageInfo)}, pageIndex: ${pageIndex}`);
  debugLog('Checking if pageInfo.total or pageInfo.limit is undefined');
  if (pageInfo.total === undefined || pageInfo.limit === undefined) {
    debugLog('pageInfo.total or pageInfo.limit is undefined, throwing error');
    throw new Error('Expected query to have paginated metadata');
  }

  debugLog('Checking if pageIndex is less than pageInfo.total divided by pageInfo.limit');
  if (pageIndex < pageInfo.total! / pageInfo.limit!) {
    debugLog('pageIndex is less than pageInfo.total divided by pageInfo.limit, incrementing pageIndex');
    return pageIndex++;
  }
  debugLog('Returning undefined');
  return undefined;
}
