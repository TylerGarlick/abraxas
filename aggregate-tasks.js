#!/usr/bin/env node
const fs=require('fs');
const path=require('path');

const workspace='/home/ubuntu/.openclaw/workspace';
const repos=[
  'the-red-book','curiosity-hour','outerspace','satchel','mission-control','mary-jane','asclepius','biz-plans','amplify','find-Guarana'
];
let all=[];
repos.forEach(r=>{
  const base=path.join(workspace,r);
  if(!fs.existsSync(base)) return;
  const tJson=path.join(base,'tasks.json');
  if(fs.existsSync(tJson)){
    try{const d=JSON.parse(fs.readFileSync(tJson,'utf8')); if(d.tasks) all.push(...d.tasks);}catch(e){}
  }
  const tDir=path.join(base,'tasks');
  if(fs.existsSync(tDir) && fs.lstatSync(tDir).isDirectory()){
    fs.readdirSync(tDir).forEach(f=>{
      if(f.endsWith('.json')){
        try{const d=JSON.parse(fs.readFileSync(path.join(tDir,f),'utf8')); if(d.tasks) all.push(...d.tasks);}catch(e){}
      }
    });
  }
});
const outPath=path.join(workspace,'tasks.json');
fs.writeFileSync(outPath,JSON.stringify({tasks:all},null,2),'utf8');
console.log(JSON.stringify({tasks:all},null,2));
