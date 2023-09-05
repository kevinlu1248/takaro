import { MetadataOutput } from '@takaro/apiclient';
import winston from 'winston';
import config from '@takaro/config';

export function hasNextPage(pageInfo: MetadataOutput, pageIndex: number) {
  if (config.get('debug')) {
    winston.debug(`hasNextPage called with pageInfo: ${JSON.stringify(pageInfo)}, pageIndex: ${pageIndex}`);
  }

  if (pageInfo.total === undefined || pageInfo.limit === undefined) {
    throw new Error('Expected query to have paginated metadata');
  }

  if (pageIndex < pageInfo.total! / pageInfo.limit!) {
    if (config.get('debug')) {
      winston.debug(`hasNextPage returning: ${pageIndex < pageInfo.total! / pageInfo.limit!}`);
    }
    return pageIndex++;
  }

  if (config.get('debug')) {
    winston.debug('hasNextPage returning: undefined');
  }
  return undefined;
}
