declare module 'discord-utils'
{
  import { Client, Message, Guild } from 'discord.js';

  class Command
  {
    public keyword: string;
    public aliases: string[];
    public description: string;
    public action(context: Context): void;
  }

  class Module
  {
    public commands: Command[];
    public rules:
    {
      guild: boolean;
      dm: boolean;
      developer: boolean;
      roles: string[];
      users: string[];
      channels: string[];
    }

    public addCommands(commands: Command[]): void;
    public setCommandsPath(path: string): void;
  }

  class Context
  {
    constructor(bot: Client)
    public modules: Module[];
    public config: object;
    public message: Message;
    public bot: Client;
    public guild: Guild;
    public parameters: string[];
    public raw_parameters: string;

    public from(message: Message): void;
    public addModules(modules: Module[]): void;
    public setModulesPath(path: string): void;
    public setConfig(config: object): void;
    public saveConfig(): void;
  }
}
