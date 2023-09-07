import { MetadataOutput } from '@takaro/apiclient';

export function hasNextPage(pageInfo: MetadataOutput, pageIndex: number) {
  console.log(`hasNextPage called with pageInfo: ${JSON.stringify(pageInfo)}, pageIndex: ${pageIndex}`);
  if (pageInfo.total === undefined || pageInfo.limit === undefined) {
    throw new Error('Expected query to have paginated metadata');
  }

  if (pageIndex < pageInfo.total! / pageInfo.limit!) {
    console.log(`hasNextPage returning with value: ${pageIndex + 1}`);
    return pageIndex++;
  }
  console.log(`hasNextPage returning with value: undefined`);
  return undefined;
}
