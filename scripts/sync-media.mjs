// Synchronize local approved images into the build-time portfolio media catalog.
// Project folder names are project IDs; no React/Three.js changes needed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const assetsRoot=path.join(root,'public','projects');
const manifestFile=path.join(root,'src','data','project-media.json');
const allowed=new Set(['.webp','.png','.jpg','.jpeg','.avif','.svg']);
const existing=JSON.parse(fs.readFileSync(manifestFile,'utf8'));
const manifest={...existing};
let total=0;
if(fs.existsSync(assetsRoot)){
  for(const item of fs.readdirSync(assetsRoot,{withFileTypes:true})){
    if(!item.isDirectory())continue;
    const folder=path.join(assetsRoot,item.name);
    const files=fs.readdirSync(folder).filter(file=>allowed.has(path.extname(file).toLowerCase())).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
    if(!files.length)continue;
    const previous=Object.fromEntries((existing[item.name]||[]).map(m=>[m.src,m]));
    manifest[item.name]=files.map((file,index)=>{
      const src=`/projects/${item.name}/${file}`;
      const saved=previous[src];
      const page=(file.match(/(?:page|screen)-(\d+)/)||[])[1];
      const caption=saved?.caption || `${item.name.toUpperCase()} — ${page ? 'original PDF page '+Number(page) : 'screen '+(index+1)}`;
      return {
        src,
        alt:saved?.alt || caption,
        caption,
        kind:saved?.kind || 'prototype'
      };
    });
    total+=files.length;
  }
}
fs.writeFileSync(manifestFile,JSON.stringify(manifest,null,2)+'\n');
console.log(`Synchronized ${total} published project image(s) across ${Object.keys(manifest).length} projects.`);
