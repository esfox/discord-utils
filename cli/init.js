const fs = require('fs');
const path = require('path');

const templatesPath = `${__dirname}/templates`;
const botTemplate = fs.readFileSync(`${templatesPath}/bot`, 'utf8');
const packageTemplate = fs.readFileSync(`${templatesPath}/package`, 'utf8');

module.exports = _ =>
{
  const project = path.basename(process.cwd())
    .toLowerCase()
    .replace(/\s/g, '-');

  fs.mkdirSync('modules');
  fs.writeFileSync('bot.js', botTemplate);
  fs.writeFileSync('package.json', packageTemplate
    .replace('<NAME>', project));
  console.log(`Initialized Discord bot project "${project}".`);
}