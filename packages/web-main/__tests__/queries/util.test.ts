import { hasNextPage } from '../../src/queries/util';
import winston from 'winston';
import { MetadataOutput } from '@takaro/apiclient';

describe('hasNextPage function', () => {
  it('should log debug statements correctly', () => {
    const pageInfo: MetadataOutput = {
      total: 10,
      limit: 5,
    };
    const pageIndex = 1;

    const debugSpy = jest.spyOn(winston, 'debug');

    hasNextPage(pageInfo, pageIndex);

    expect(debugSpy).toHaveBeenCalledWith(`pageInfo: ${JSON.stringify(pageInfo)}, pageIndex: ${pageIndex}`);
    expect(debugSpy).toHaveBeenCalledWith('Result: 2');
  });
});
