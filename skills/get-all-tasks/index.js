#!/usr/bin/env node
const fs=require('fs');
const path=require('path');
const {execSync}=require('child_process');

const repoList=[
  'the-red-book','curiosity-hour','outerspace','satchel','','mary-jane','asclepius','biz-plans','amplify','find-Guarana'
];
const workspace='/home/ubuntu/.openclaw/workspace';
let all=[];
repoList.forEach(r=>{
  const base=path.join(workspace,r);
  if(!fs.existsSync(base)) return;
  const tRoot=path.join(base,'tasks.json');
  if(fs.existsSync(tRoot)){
    try{const d=JSON.parse(fs.readFileSync(tRoot,'utf8')); if(d.tasks) all.push(...d.tasks);}catch(e){}
  }
  const tSkill=path.join(base,'skills','tasks.json');
  if(fs.existsSync(tSkill)){
    try{const d=JSON.parse(fs.readFileSync(tSkill,'utf8')); if(d.tasks) all.push(...d.tasks);}catch(e){}
  }
  const tDir=path.join(base,'skills','tasks');
  if(fs.existsSync(tDir)&&fs.lstatSync(tDir).isDirectory()){
    fs.readdirSync(tDir).forEach(file=>{
      if(file.endsWith('.json')){
        try{const d=JSON.parse(fs.readFileSync(path.join(tDir,file),'utf8')); if(d.tasks) all.push(...d.tasks);}catch(e){}
      }
    });
  }
});
const outPath=path.join(workspace,'','tasks.json');
fs.writeFileSync(outPath,JSON.stringify({tasks:all},null,2),'utf8');
const date=new Date().toISOString().split('T')[0];
try{execSync('git pull --rebase  master', {cwd:workspace, stdio:'inherit'});}catch(e){}
execSync('git add /tasks.json', {cwd:workspace, stdio:'inherit'});
execSync(`git commit -m "Aggregate tasks ${date}"`, {cwd:workspace, stdio:'inherit'});
execSync('git push  master', {cwd:workspace, stdio:'inherit'});
console.log('Aggregated and pushed to  tasks.json');
