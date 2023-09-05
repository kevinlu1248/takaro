import { hasNextPage } from '../../src/queries/util';
import winston from 'winston';
import config from '@takaro/config';
import { MetadataOutput } from '@takaro/apiclient';

jest.mock('winston', () => ({
  debug: jest.fn(),
}));

describe('hasNextPage', () => {
  beforeEach(() => {
    config.set('debug', true);
  });

  afterEach(() => {
    config.set('debug', false);
  });

  it('should log correct information when debug is enabled', () => {
    const pageInfo: MetadataOutput = {
      total: 10,
      limit: 5,
    };
    const pageIndex = 1;

    hasNextPage(pageInfo, pageIndex);

    expect(winston.debug).toHaveBeenCalledWith(`hasNextPage called with pageInfo: ${JSON.stringify(pageInfo)}, pageIndex: ${pageIndex}`);
    expect(winston.debug).toHaveBeenCalledWith(`hasNextPage returning: ${pageIndex < pageInfo.total! / pageInfo.limit!}`);
  });
});
