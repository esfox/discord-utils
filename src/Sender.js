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

		return this.message.channel.send(content, options);
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

		if(this.message && (this.message.channel.type === 'dm' &&
			this.message.author.id === this.getConfig.developer.id))
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
		const embed = new Discord.RichEmbed()
			.setColor(defaultConfig ? this.getConfig.embed_color : '#36393f');

		if(title) embed.setTitle(title);
		if(description) embed.setDescription(description);

		return embed;
	}
}
