const Discord = require('discord.js');
const config = require('./config.json');

module.exports = class Sender
{
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
		if(toReply)
			return this.message.reply(content, options);

		return this.message.channel.send(content, options);
	}

	/**
	 * @param {any | Error} error 
	 * @param {import('./Context')} [context]
	 */
	error(error, context)
	{
		console.error(error);

		if(context || context.bot)
		{
			/** @type {import('discord.js').User} */
			const developer = context.bot.users.get(config.developer.id);
			developer.send(this.embed('❌  An error occurred.')
				.setColor('#dd2e44')
				.addField('Command', context.command)
				.addField('Error', error.toString())
				.setTimestamp())
				.catch(console.error);
		}

		if(context.message.channel.type === 'dm' &&
			context.message.author.id === config.developer.id)
			return;

		return this.send(config.error_message);
	}

	/**
	 * @param {string} title 
	 * @param {string} [description] 
	 * @return {import('discord.js').RichEmbed}
	 */
	embed(title, description)
	{
		const embed = new Discord.RichEmbed()
			.setColor(config ? config.embed_color : '#36393f');

		if(title) embed.setTitle(title);
		if(description) embed.setDescription(description);

		return embed;
	}
}
