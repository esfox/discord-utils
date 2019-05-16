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
  fs.readdirSync(path.startsWith('/')? path.substr(1) : path)
    .filter(file => file.indexOf('.') !== 0 && file.slice(-3) === '.js')
    .map(file => new (require(`${path}/${file}`))())
    .filter(item => item instanceof type);