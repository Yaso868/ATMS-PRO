#!/usr/bin/env node
'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const prompt=fs.readFileSync(path.join(root,'ATMS_PRO_MASTER_PROMPT_2026-10-08.md'),'utf8');
const rules=fs.readFileSync(path.join(root,'AGENTS.md'),'utf8');
for(const [name,re] of [['v1.1',/Version:\*\* 1\.1/],['prior consent',/Keine dauerhafte Eintragung ohne vorherige Zustimmung/],['one zip',/ZIP/],['must patch',/JETZT PATCHEN/],['copy',/Commit-Name/],['golden',/Golden/]]){
  assert(re.test(prompt),'Master prompt missing '+name);
}
for(const term of ['ATMS_PRO_MASTER_PROMPT_2026-10-08.md','JETZT PATCHEN','SHA256.txt','separaten','P113.4'])
  assert(rules.includes(term),'AGENTS gate missing '+term);
console.log('P114.7 checked-in master-prompt and release-process rules: PASS');
