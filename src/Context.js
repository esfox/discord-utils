const config = require('./config.json');
const save = require('util').promisify(require('fs').writeFile);

const Sender = require('./Sender');
const Module = require('./Module');
const util = require('./util');

/** @typedef {import('./Module')[]} Modules */

module.exports = class Context extends Sender
{
	/** @param {import('discord.js').Client} bot */
	constructor(bot)
	{
		if(!bot)
			throw new Error('Please pass the client as a parameter.');

		super();

		/** @type {Modules} */
		this.modules = [];
		this.config = config;

		bot.on('ready', _ =>
		{
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
		this.message = message;
		this.bot = message.client;
		this.guild = message.guild;

		let chat = message.content;
		const prefix = config.prefixes.find(prefix => chat.startsWith(prefix));
		if(!prefix)
			return;

		let [ keyword, ...parameters ] = chat
			.substr(prefix.length)
			.replace(/\s\s+/g, ' ')
			.trim()
			.split(' ');

		keyword = keyword.toLowerCase();
		this.parameters = parameters.length > 0? parameters : undefined;
		this.raw_parameters = chat.indexOf(' ') >= 0?
			chat.substr(chat.indexOf(' ') + 1) : undefined;

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

			this.command = command.keyword;
			_module.handle(this);
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

	/**
	 * @param {any} database 
	 * @param {string} [propertyName]
	 */
	setDatabase(database, propertyName)
	{
		/** @type {Object} */
		this[propertyName? propertyName : 'database'] = database;
	}

	saveConfig()
	{
		save(`${__dirname}/config.json`, JSON.stringify(this.config, null, 2))
			.then(_ => Promise.resolve(true))
			.catch(this.error);
	}
}