import { config } from './config.js';
import winston from 'winston';
import { JsonObject } from 'type-fest';
import { omit } from 'lodash-es';
import { ctx } from './context.js';

const { colorize, timestamp, printf, combine, json, errors } = winston.format;

config.validate();

const addCtx = winston.format((info: winston.Logform.TransformableInfo) => {
  return { ...ctx.data, ...info };
});

const myFormat = printf((info) => {
  const { level, message, namespace, timestamp } = info;

  const cleanMeta = omit(info, 'level', 'message', 'namespace', 'timestamp', 'service', 'labels', 'txId');

  let metaString = '';
  if (Object.getOwnPropertyNames(cleanMeta).length) {
    try {
      metaString = `| ${JSON.stringify(cleanMeta, Object.getOwnPropertyNames(cleanMeta))}`;
    } catch (e) {
      metaString = '| Invalid Meta Information';
    }
  }

  const paddedNamespace = `[${namespace}]`.padEnd(10);

  if (config.get('logging.minimal')) {
    return `${paddedNamespace} ${level} ${message}`;
  }

  return `${timestamp} ${paddedNamespace} ${level}: ${message} ${metaString ? metaString : ''}`;
});

const simpleFormat = combine(
  addCtx(),
  errors({ stack: true }),
  timestamp({
    format: 'isoDateTime',
  }),
  colorize(),
  myFormat
);

const jsonFormat = combine(addCtx(), json());

let level = config.get('logging.level');

if (config.get('mode') === 'test' && process.env.LOGGING_LEVEL === undefined) {
  level = 'none';
}

const transports = [
  new winston.transports.Console({
    level,
    format: config.get('logging.json') ? jsonFormat : simpleFormat,
    silent: level === 'none',
  }),
];

const mainLogger = winston.createLogger({
  transports,
});

export function logger(namespace: string, meta?: JsonObject): winston.Logger {
  return mainLogger.child({ namespace, meta });
}
