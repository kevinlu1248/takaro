import { Config, IBaseConfig } from '@takaro/config';
import { errors } from '@takaro/util';
import { queuesConfigSchema, IQueuesConfig } from '@takaro/queues';

export enum EXECUTION_MODE {
  CONTAINERD = 'containerd',
  LOCAL = 'local',
}

interface IAgentConfig extends IBaseConfig {
  http: {
    port: number;
    allowedOrigins: string[];
  };
  takaro: {
    url: string;
  };
  redis: {
    host: string;
    port: number;
    username: string;
    password: string;
    tlsCa: string;
  };
  functions: {
    executionMode: EXECUTION_MODE;
  };
  firecracker: {
    binary: string;
    kernelImage: string;
    rootfs: string;
    sockets: string;
    logPath: string;
  };
}

const configSchema = {
  http: {
    port: {
      doc: 'The port to bind.',
      // This value can be ANYTHING because it is user provided
      format: (value: unknown) => {
        if (process.env.NODE_ENV === 'test') {
          // This allows us to pass 'undefined' as the port
          // Which lets the tests run without needed to open an actual port
          return value;
        }

        if (typeof value !== 'string' && typeof value !== 'number') {
          throw new errors.ConfigError('Value must be a string or number');
        }

        const parsed = parseInt(value.toString(), 10);

        if (parsed < 0 || parsed > 65535) {
          throw new errors.ConfigError('ports must be within range 0 - 65535');
        }
      },
      default: 3001,
      env: 'PORT',
    },
    allowedOrigins: {
      doc: 'The origins that are allowed to access the API',
      format: Array,
      default: [],
      env: 'CORS_ALLOWED_ORIGINS',
    },
  },
  redis: {
    host: {
      doc: 'The host of the redis server',
      format: String,
      default: 'localhost',
      env: 'REDIS_HOST',
    },
    port: {
      doc: 'The port of the redis server',
      format: Number,
      default: 6379,
      env: 'REDIS_PORT',
    },
    username: {
      doc: 'The username of the redis server',
      format: String,
      default: '',
      env: 'REDIS_USERNAME',
    },
    password: {
      doc: 'The password of the redis server',
      format: String,
      default: '',
      env: 'REDIS_PASSWORD',
    },
    tlsCa: {
      doc: 'Optional TLS certificate, if the redis server is using TLS',
      format: String,
      default: '',
      env: 'REDIS_TLS_CA',
    },
  },
  functions: {
    executionMode: {
      doc: 'The mode to use when executing functions. Setting to "local" is VERY INSECURE! Only do it if you know what you are doing',
      format: [EXECUTION_MODE.CONTAINERD, EXECUTION_MODE.LOCAL],
      default: EXECUTION_MODE.CONTAINERD,
      env: 'FUNCTIONS_EXECUTION_MODE',
    },
  },
  takaro: {
    url: {
      doc: 'The URL of the Takaro server',
      format: String,
      default: 'http://localhost:3000',
      env: 'TAKARO_HOST',
    },
  },
  firecracker: {
    binary: {
      doc: 'Path to Firecracker binary',
      format: String,
      default: '/usr/bin/firecracker',
      env: 'FIRECRACKER_BINARY',
    },
    kernelImage: {
      doc: 'Path to the kernel image used by the microVM',
      format: String,
      default: '/home/branco/dev/takaro/firecracker/vmlinux.bin',
      env: 'FIRECRACKER_KERNEL_IMAGE',
    },
    rootfs: {
      doc: 'Path to the rootfs used by the microVM',
      format: String,
      default: '/home/branco/dev/takaro/firecracker/rootfs.ext4',
      env: 'FIRECRACKER_ROOTFS',
    },
    sockets: {
      doc: 'Path to the socket directory used by Firecracker',
      format: String,
      default: '/tmp/takaro/sockets/',
      env: 'FIRECRACKER_SOCKET',
    },
    logPath: {
      doc: 'Path to the log file used by Firecracker',
      format: String,
      default: '/home/branco/dev/takaro/firecracker/',
      env: 'FIRECRACKER_LOG_PATH',
    },
  },
};

export const config = new Config<IAgentConfig & IQueuesConfig>([
  configSchema,
  queuesConfigSchema,
]);
