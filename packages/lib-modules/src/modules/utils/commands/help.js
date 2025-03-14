import { getTakaro, getData } from '@takaro/helpers';

async function main() {
  const data = await getData();
  const takaro = await getTakaro(data);

  const enabledModules = await takaro.gameserver.gameServerControllerGetInstalledModules(data.gameServerId);

  const moduleCommands = await Promise.all(
    enabledModules.data.data.map(async (mod) => {
      return (await takaro.module.moduleControllerGetOne(mod.moduleId)).data.data.commands;
    })
  );

  if (data.arguments.command === 'all') {
    await data.player.pm('Available commands:');

    for (const mod of moduleCommands) {
      await Promise.all(
        mod.map(async (command) => {
          await data.player.pm(`${command.name}: ${command.helpText}`);
        })
      );
    }
  } else {
    const allCommandsFlat = moduleCommands.flat();
    const requestedCommand = allCommandsFlat.find((c) => {
      return c.name === data.arguments.command;
    });

    if (!requestedCommand) {
      await data.player.pm(
        `Unknown command "${data.arguments.command}", use this command without arguments to see all available commands.`
      );
    } else {
      await data.player.pm(`${requestedCommand.name}: ${requestedCommand.helpText}`);
    }
  }
}

await main();
