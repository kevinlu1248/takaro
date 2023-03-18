import { Job } from 'bullmq';
import { config } from '../../config.js';
import { TakaroWorker, IJobData } from '@takaro/queues';
import { ctx } from '@takaro/util';
import { executeFunction } from './executeFunction.js';
import { ory } from '@takaro/auth';

export class CommandWorker extends TakaroWorker<IJobData> {
  constructor() {
    super(config.get('queues.commands.name'), processCommand);
  }
}

async function processCommand(job: Job<IJobData>) {
  ctx.addData({
    domain: job.data.domainId,
    gameServer: job.data.gameServerId,
  });

  const token = await ory.getJobToken(job.data.domainId);

  await executeFunction(
    job.data.function,
    {
      ...job.data.data,
      gameServerId: job.data.gameServerId,
    },
    token
  );
}
