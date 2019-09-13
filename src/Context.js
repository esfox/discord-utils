const config = require('./config.json');
const save = require('util').promisify(require('fs').writeFile);

const Sender = require('./Sender');
const Module = require('./Module');
const util = require('./util');

/** @typedef {import('./Module')[]} Modules */
let botIsStarted = false;

module.exports = class Context extends Sender
{
	/** @param {import('discord.js').Client} bot */
	constructor(bot)
	{
		super();

		if(botIsStarted)
			return;

		if(!bot)
			throw new Error('Please pass the client as a parameter.');

		/** @type {Modules} */
		this.modules = [];
		this.config = config;

		/** @type {import('discord.js').Message} */
		this.message = undefined;
		this.bot = undefined;
		this.guild = undefined;
		this.parameters = undefined;
		this.raw_parameters = undefined;

		bot.on('ready', _ =>
		{
			botIsStarted = true;

			/** @type {string[]} */
			const keywords = this.modules.reduce((commands, _module) => commands
				.concat(_module.commands), [])
				.reduce((keywords, command) => 
					keywords.concat([command.keyword].concat(command.aliases)), []);

			const duplicates = keywords.filter((keyword, i) => 
				keywords.indexOf(keyword) !== i);

			if(duplicates.length !== 0)
				throw new Error('The following are duplicate command names or aliases:'
					+ `\n${duplicates.map(d => `"${d}"`).join(', ')}`);
		});
	}

	/** @param {import('discord.js').Message} message */
	from(message)
	{
		let chat = message.content;
		const prefix = this.config.prefixes.find(p => chat.startsWith(p));
		if(!prefix)
			return;

		let [ keyword, ...parameters ] = chat
			.substr(prefix.length)
			.replace(/\s\s+/g, ' ')
			.trim()
			.split(' ');

		keyword = keyword.toLowerCase();

		for(let _module of this.modules)
		{
			const command = _module.commands.find(c => 
			{
				if(c.keyword === keyword)
					return true;

				if(c.aliases)
					return c.aliases.includes(keyword);

				return;
			});

			if(!command)
				continue;

			const context = new Context();
			context.command = command.keyword;
			context.config = this.config;
			context.message = message;
			context.bot = message.client;
			context.guild = message.guild;
			context.parameters = parameters.length > 0? parameters : undefined;
			context.raw_parameters = chat.indexOf(' ') >= 0?
				chat.substr(chat.indexOf(' ') + 1) : undefined;

			_module.handle(context);
		}
	}

	/** @param {Modules} modules */
	addModules(modules)
	{
		this.modules = util.addItems(Module, this.modules, modules);
	}

	/** @param {string} path */
	setModulesPath(path)
	{
		this.modules = util.addItemsFromPath(Module, path);
	}

	/** @param {Object} config */
	setConfig(config)
	{
		if(typeof config !== 'object')
			throw new Error('Please pass an object for the config.');

		this.config = config;
	}

	saveConfig()
	{
		save(`${__dirname}/config.json`, JSON.stringify(this.config, null, 2))
			.then(_ => Promise.resolve(true))
			.catch(this.error);
	}
}