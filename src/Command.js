module.exports = class Command
{
	constructor()
	{
		/** @type {string} */
		this.keyword = undefined;

		/** @type {string[]} */
		this.aliases = [];

		/** @type {string} */
		this.description = undefined;
	}
	
	/** @param {import('./Context')} context */
	action(context)
	{
		context.send("❌  This command's action has not yet been overridden.");
	}
}