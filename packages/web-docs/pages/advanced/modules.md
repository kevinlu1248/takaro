# Modules

The core of Takaro is built around Modules. Modules are a very powerful and flexible way of creating features..

Takaro comes with a set of [built-in modules](./builtin-modules.mdx). When you enable these on a Gameserver, you will be able to change the configuration of the module to customize it but you cannot edit the code. This allows Takaro to automatically keep the built-in modules up-to-date. 

Each module consists of one or more of the following components:

- Hooks
- Cronjobs
- Commands

## Hooks

Hooks are triggered when a certain event happens on a Gameserver. Think of it as a callback function that is executed when a certain event happens. For example, when a player joins a server, a Hook can be triggered that will send a message to the player.

You can optionally add a string filter to hooks, allowing you more control over when it fires exactly. For advanced users, [regex](https://en.wikipedia.org/wiki/Regular_expression) filtering is also supported.

## Cronjobs

Cronjobs are triggered based on time. This can be a simple repeating pattern like "Every 5 minutes" or "Every day" or you can use raw [Cron](https://en.wikipedia.org/wiki/Cron) syntax to define more complex patterns like "Every Monday, Wednesday and Friday at 2 PM";

## Commands

Commands are triggered by a user. They are triggered when a player sends a chat message starting with the configured command prefix. Note that this means that commands are a _manual_ action, unlike Hooks and Cronjobs which are triggered with any user-intervention.

Commands support parameters, allowing you to pass data to the Function. For example, you can create a command that allows players to teleport to a specific location. The command could look like `/teleport homeBase`

# Configuration

Every Module can have a certain configuration, allowing you to customize it's behavior without having to edit any code. Every Hook, Cronjob and Command will be able to read this config.

As a contrived example, a config like the following exists

```json
{
  "extraMessage": "Don't forget to read the rules :)"
}
```

And a Hook on the event `playerConnected`, which fires whenever a Player connects to the Gameserver. The Function code:

```js

import { getTakaro } from '@takaro/helpers';

async function main() {
    await takaro.gameserver.gameServerControllerSendMessage(data.gameServerId, {
      message: `Welcome to the server, ${data.player.name}. ${data.config.extraMessage}`,
  });
}

main();

```

Would result in a message in-game saying `Welcome to the server, John Doe! Don't forget to read the rules :)`
