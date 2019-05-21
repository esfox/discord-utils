const fs = require('fs');

/** 
 * @typedef {import('./Module')} Module 
 * @typedef {import('./Command')} Command
 * @typedef {Module|Command} Item
 * */

/** 
 * @param {Item} type 
 * @param {Item[]} array
 * @param {Item[]} items
 * */
exports.addItems = (type, array, items) =>
  array.concat((Array.isArray(items)? items : [ items ])
    .map(item => item instanceof type? item : new item())
    .filter(item => item instanceof type));

/** 
 * @param {Item} type 
 * @param {Item[]} array
 * @param {Item[]} items
 * */
exports.addItemsFromPath = (type, path) => 
{
	if(!fs.existsSync(path))
		throw new Error(`${type.name}s path does not exist.`);
		
	const getPath = file => `${path}/${file}`;
	const getExports = file => require(getPath(file));

  return fs.readdirSync(path.startsWith('/')? path.substr(1) : path)
  .reduce((items, file) =>
  {
		if(type.name !== 'Module')
			return file.indexOf('.') !== 0 && file.slice(-3) === '.js'?
				items.concat(new (getExports(file))()) : items;

		try
		{
			const dir = fs.readdirSync(getPath(file));
			let main = dir.find(f => f === 'index.js');
			if(!main)
				main = dir.find(f => f === `${file}.js`);

			if(!main)
				return items;
			
			file = getExports(`${file}/${main}`);
		}
		catch(error)
		{
			file = file.slice(-3) === '.js'? getExports(file) : undefined;
		}

		if(!file || !file.name)
			return items;

		file = new file();
		if(file instanceof type)
			return items.concat(file);

    return items;
  }, []);
}
