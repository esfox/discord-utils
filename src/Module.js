const Command = require('./Command');
const util = require('./util');

/** 
 * @typedef {import('./Command')[]} Commands 
 * @typedef {import('./Context')} Context
 * */

module.exports = class Module
{
	constructor()
	{
		/** @type {Commands} */
		this.commands = [];
		this.rules =
		{
			guild: false,
			dm: false,
			developer: false,
			roles: [],
			users: [],
			channels: [],
		}

		this.responses = 
		{
			developerOnly: '❌  Only the developer is allowed to use this command.',
			guildOnly: '❌  This command is only allowed in a guild.',
			dmOnly: '❌  This command is only allowed in private messages.',
			channelsOnly: '❌  This command is not allowed in this channel.',
			noPermission: "❌  You don't have permission to use this command.",
		}
	}

	/** @param {Commands} commands */
	addCommands(commands)
	{
		this.commands = util.addItems(Command, this.commands, commands);
	}

	/** @param {string} path*/
	setCommandsPath(path)
	{
		this.commands = util.addItemsFromPath(Command, path);
	}

	/** @param {Context} context */
	handle(context)
	{
		if(!this.passRules(context))
			return;
		
		this.doCommand(context);
	}

	/** @param {Context} context */
	passRules(context)
	{
		if(this.inDevelopmentMode(context))
			return;

		if(this.developerOnly(context))
			return;
			
		if(this.dmOnly(context))
			return;

		if(this.guildOnly(context))
			return;

		if(this.rolesOnly(context))
			return;

		if(this.usersOnly(context))
			return;

		if(this.channelsOnly(context))
			return;
		
		return true;
	}

	/** @param {Context} context */
	doCommand(context)
	{
		const command = this.commands.find(c => c.keyword === context.command);
		command.action(context);
	}

	/** @param {Context} context */
	inDevelopmentMode(context)
	{
		if(!context.config.developer.mode)
			return;

		if(context.message.author.id !== context.config.developer.id)
		{
			context.send('🛠  Bot is in developent mode.');
			return true;
		}
		return;
	}

	/** @param {Context} context */
	developerOnly(context)
	{
		if
		(
			this.rules.developer && 
			context.message.author.id !== context.config.developer.id
		)
		{
			context.reply(this.responses.developerOnly);
			return true;
		}
		return;
	}

	/** @param {Context} context */
	guildOnly(context)
	{
		if(this.rules.guild && context.message.channel.type !== 'text')
		{
			context.reply(this.responses.guildOnly);
			return true;
		}
		return;
	}

	/** @param {Context} context */
	dmOnly(context)
	{
		if(this.rules.dm && context.message.channel.type === 'text')
		{
			context.reply(this.responses.dmOnly);
			return true;
		}
		return;
	}

	/** @param {Context} context */
	rolesOnly(context)
	{
		if(this.rules.roles.length === 0)
			return;

		if(this.rules.roles.every(role => 
			!context.message.member.roles.keyArray().includes(role)))
		{
			context.reply(this.responses.noPermission);
			return true;
		}
		return;
	}

	/** @param {Context} context */
	usersOnly(context)
	{
		if(this.rules.users.length === 0)
			return;

		if(!this.rules.users.includes(context.message.author.id))
		{
			context.reply(this.responses.noPermission);
			return true;
		}
		return;
	}

	/** @param {Context} context */
	channelsOnly(context)
	{
		if(this.rules.channels.length === 0)
			return;

		if(!this.rules.channels.includes(context.message.channel.id))
		{
			context.reply(this.responses.channelsOnly);
			return true;
		}
		return;
	}
}