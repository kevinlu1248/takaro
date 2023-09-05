import { MetadataOutput } from '@takaro/apiclient';
import winston from 'winston';

export function hasNextPage(pageInfo: MetadataOutput, pageIndex: number) {
  winston.debug(`pageInfo: ${JSON.stringify(pageInfo)}, pageIndex: ${pageIndex}`);
  if (pageInfo.total === undefined || pageInfo.limit === undefined) {
    throw new Error('Expected query to have paginated metadata');
  }

  if (pageIndex < pageInfo.total! / pageInfo.limit!) {
    const result = pageIndex++;
    winston.debug(`Result: ${result}`);
    return result;
  }
  winston.debug('Result: undefined');
  return undefined;
}
