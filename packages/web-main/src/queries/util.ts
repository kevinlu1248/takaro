import { MetadataOutput } from '@takaro/apiclient';

export function hasNextPage(pageInfo: MetadataOutput, pageIndex: number) {
  if (process.env.NODE_ENV === 'development') {
    console.debug('hasNextPage input parameters:', { pageInfo, pageIndex });
  }
  if (pageInfo.total === undefined || pageInfo.limit === undefined) {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Throwing error: Expected query to have paginated metadata');
    }
    throw new Error('Expected query to have paginated metadata');
  }

  if (pageIndex < pageInfo.total! / pageInfo.limit!) {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Incrementing pageIndex');
    }
    return pageIndex++;
  }
  if (process.env.NODE_ENV === 'development') {
    console.debug('Returning undefined');
  }
  return undefined;
}
