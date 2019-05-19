const fs = require('fs');
const path = require('path');

const templatesPath = `${__dirname}/templates`;
const templates = fs.readdirSync(templatesPath)
  .reduce((templates, template) =>
  {
    templates[template] = 
      fs.readFileSync(`${templatesPath}/${template}`, 'utf8');
    return templates;
  }, {});

const modulesPath = `${process.cwd()}/modules`;

/** 
 * @param {string} type
 * @param {string} name
 * @param {string} dir
 * */
module.exports = (type, name, directory) =>
{
  const cwd = process.cwd();
  type = [ 'module', 'command' ].find(t => t === type.toLowerCase());
  if(!type)
    return console.log('Invalid type.');

  if(!name)
    return console.log('No name entered.');

  name = name.toLowerCase();
  if(name !== path.basename(name))
    return console.log('Please enter a valid name.');

  let dir = directory;
  const isModule = type === 'module';
  const isDirectory = /\\|\//.test(dir);
  const defaultDirectory = `${cwd}/${dir}`;

  if(isModule)
  {
    if(dir)
    {
      if(!isDirectory)
        return console.log('Please enter a path for the module.');

      dir = defaultDirectory;
    }
    else
      dir = `${modulesPath}/${name}`;
  }
  else
  {
    if(!dir)
      return console.log('Please enter the path or module of the command.');
    
    if(!isDirectory)
      dir = `${modulesPath}/${dir}/commands`;
    else
      dir = defaultDirectory;
  }

  dir = path.resolve(dir);
  path.relative(cwd, dir).split(path.sep).forEach((p, i, paths) =>
  {
    p = paths.slice(0, i).join(path.sep) + (i > 0? path.sep : '') + p;
    if(!fs.existsSync(p))
      fs.mkdirSync(p);
  });
    
  dir = `${dir}${path.sep}${isModule && !directory? 'index' : name}.js`;

  let template = templates[type];
  if(isModule)
  {
    if(!directory)
      template = template.replace('<COMMANDS_PATH>', '${__dirname}/commands');
  }
  else
    template = template.replace('<KEYWORD>', name);

  try { fs.writeFileSync(dir, template); }
  catch(error) { console.log(`An error occured. \n${error}`); }
  console.log(`Created a new ${type} in "${path.resolve(dir)}".`);
}
