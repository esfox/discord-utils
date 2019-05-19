#!/usr/bin/env node

const args = process.argv.slice(2);
let [ command, ...parameters ] = args;

if(![ 'init', 'new', 'help' ].includes(command))
  return console.log("That's not a valid command");

require(`./${command}`)(...parameters);