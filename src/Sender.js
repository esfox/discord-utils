const Discord = require('discord.js');
const defaultConfig = require('./config.json');

module.exports = class Sender
{
	get getConfig()
	{
		return this.config || defaultConfig;
	}

	/**
	 * @param {string} title 
	 * @param {string} [description]
	 */
	send(title, description)
	{
		return this.chat(this.embed(title, description));
	}

	/**
	 * @param {string} title 
	 * @param {string} [description]
	 */
	reply(title, description)
	{
		return this.chat(this.embed(title, description), true);
	}

	/**
	 * @param {string | import('discord.js').RichEmbed} content 
	 * @param {boolean} [toReply] 
	 * @param {import('discord.js').MessageOptions} [options] 
	 * @return {Promise<import('discord.js').Message>}
	 */
	chat(content, toReply, options)
	{
		this.message.channel.stopTyping(true);
		
		if(toReply)
			return this.message.reply(content, options);

		if(content instanceof Discord.MessageEmbed)
			return this.message.channel.send({ embed: content });

		return this.message.channel.send(content);
	}

	/** @param {any | Error} error */
	error(error)
	{
		console.error(error);

		if(this.bot)
		{
			/** @type {import('discord.js').User} */
			const developer = context.bot.users.get(this.getConfig.developer.id);
			developer.send(this.embed('❌  An error occurred.')
				.setColor('#dd2e44')
				.addField('Command', context.command)
				.addField('Error', error.toString())
				.setTimestamp())
				.catch(console.error);
		}

		const developer = this.getConfig.developer.id;
		const sender = context.message.author.id;
		const isDeveloper = Array.isArray(developer)
			? developer.includes(sender)
			: developer === sender;

		if(this.message && (this.message.channel.type === 'dm' && isDeveloper))
			return;

		return this.send(this.getConfig.error_message);
	}

	/**
	 * @param {string} [title]
	 * @param {string} [description] 
	 * @return {import('discord.js').RichEmbed}
	 */
	embed(title, description)
	{
		const embed = new Discord.MessageEmbed()
			.setColor(defaultConfig ? this.getConfig.embed_color : '#36393f');

		if(title) embed.setTitle(title);
		if(description) embed.setDescription(description);

		return embed;
	}
}
