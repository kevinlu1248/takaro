import { IntegrationTest, expect, integrationConfig } from '@takaro/test';
import { GameServerOutputDTO, GameServerCreateDTOTypeEnum } from '@takaro/apiclient';
const group = 'SettingsController';

const mockGameServer = {
  name: 'Test gameserver',
  connectionInfo: JSON.stringify({
    host: integrationConfig.get('mockGameserver.host'),
  }),
  type: GameServerCreateDTOTypeEnum.Mock,
};

const tests = [
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Get a value',
    test: async function () {
      const res = await this.client.settings.settingsControllerGetOne('commandPrefix');
      expect(res.data.data).to.be.eq('/');
      return res;
    },
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Set a value',
    test: async function () {
      await this.client.settings.settingsControllerSet('commandPrefix', {
        value: '!',
      });
      const res = await this.client.settings.settingsControllerGetOne('commandPrefix');
      expect(res.data.data).to.be.eq('!');
      return res;
    },
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Get a value with invalid key',
    test: async function () {
      const res = await this.client.settings.settingsControllerGetOne('invalidKey');
      expect(res.data.data).to.be.eq(undefined);
      return res;
    },
    expectedStatus: 400,
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Set a value with invalid key',
    test: async function () {
      const res = await this.client.settings.settingsControllerSet('invalidKey', {
        value: '!',
      });
      return res;
    },
    expectedStatus: 400,
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Can get all settings',
    test: async function () {
      const res = await this.client.settings.settingsControllerGet();
      return res;
    },
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Can get all settings with a filter',
    test: async function () {
      const res = await this.client.settings.settingsControllerGet(['commandPrefix']);
      return res;
    },
  }),
  new IntegrationTest<GameServerOutputDTO>({
    group,
    snapshot: true,
    name: 'Gameservers can overwrite global settings',
    setup: async function () {
      return (await this.client.gameserver.gameServerControllerCreate(mockGameServer)).data.data;
    },
    test: async function () {
      await this.client.settings.settingsControllerSet('commandPrefix', {
        value: '!',
        gameServerId: this.setupData.id,
      });
      const resGlobal = await this.client.settings.settingsControllerGetOne('commandPrefix');
      expect(resGlobal.data.data).to.be.eq('/');

      const resGameServer = await this.client.settings.settingsControllerGetOne('commandPrefix', this.setupData.id);
      expect(resGameServer.data.data).to.be.eq('!');

      return resGameServer;
    },
  }),
  new IntegrationTest<GameServerOutputDTO>({
    group,
    snapshot: true,
    name: 'Requesting game server settings merges with global settings',
    setup: async function () {
      return (await this.client.gameserver.gameServerControllerCreate(mockGameServer)).data.data;
    },
    test: async function () {
      await this.client.settings.settingsControllerSet('commandPrefix', {
        value: '!',
        gameServerId: this.setupData.id,
      });
      const res = await this.client.settings.settingsControllerGet(undefined, this.setupData.id);
      expect(res.data.data.commandPrefix).to.be.eq('!');
      expect(res.data.data.serverChatName).to.be.eq('Takaro');

      const globalRes = await this.client.settings.settingsControllerGet();
      expect(globalRes.data.data.commandPrefix).to.be.eq('/');
      expect(globalRes.data.data.serverChatName).to.be.eq('Takaro');

      return res;
    },
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Rejects numbers as input',
    test: async function () {
      await this.client.settings.settingsControllerSet('commandPrefix', {
        // @ts-expect-error TS correctly throws an error, but we want to test runtime here
        value: 123,
      });
      const res = await this.client.settings.settingsControllerGetOne('commandPrefix');

      expect(res.data.data).to.be.eq('123');
      return res;
    },
    expectedStatus: 400,
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
