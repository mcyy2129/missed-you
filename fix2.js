const fs = require('fs');
const path = require('path');

const dirs = ['app/blog', 'components/blog'];

const replacements = [
  // Fix ../../../components/ → @/components/blog/
  ["from '../../../components/", "from '@/components/blog/"],
  ['from "../../../components/', 'from "@/components/blog/'],
  // Fix ../../components/ → @/components/blog/
  ["from '../../components/", "from '@/components/blog/"],
  ['from "../../components/', 'from "@/components/blog/'],
  // Fix ../components/ → @/components/blog/
  ["from '../components/", "from '@/components/blog/"],
  ['from "../components/', 'from "@/components/blog/'],
  // Fix ../../../siteConfig → @/siteConfig_blog
  ["from '../../../siteConfig'", "from '@/siteConfig_blog'"],
  ['from "../../../siteConfig"', 'from "@/siteConfig_blog"'],
  // Fix ../../siteConfig → @/siteConfig_blog
  ["from '../../siteConfig'", "from '@/siteConfig_blog'"],
  ['from "../../siteConfig"', 'from "@/siteConfig_blog"'],
  // Fix ../siteConfig → @/siteConfig_blog
  ["from '../siteConfig'", "from '@/siteConfig_blog'"],
  ['from "../siteConfig"', 'from "@/siteConfig_blog"'],
  // Fix ./siteConfig → @/siteConfig_blog
  ["from './siteConfig'", "from '@/siteConfig_blog'"],
  ['from "./siteConfig"', 'from "@/siteConfig_blog"'],
  // Fix @/siteConfig (without _blog) → @/siteConfig_blog
  ["from '@/siteConfig'", "from '@/siteConfig_blog'"],
  ['from "@/siteConfig"', 'from "@/siteConfig_blog"'],
  // Fix ../../data/ → @/data/blog/
  ["from '../../data/", "from '@/data/blog/"],
  ['from "../../data/', 'from "@/data/blog/'],
  // Fix ../data/ → @/data/blog/
  ["from '../data/", "from '@/data/blog/"],
  ['from "../data/', 'from "@/data/blog/'],
];

let count = 0;
for (const d of dirs) {
  if (!fs.existsSync(d)) continue;
  function walk(dir) {
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) { walk(p); continue; }
      if (!f.endsWith('.tsx') && !f.endsWith('.ts')) continue;
      let content = fs.readFileSync(p, 'utf-8');
      let orig = content;
      for (const [old, repl] of replacements) {
        while (content.includes(old)) content = content.split(old).join(repl);
      }
      if (content !== orig) {
        fs.writeFileSync(p, content, 'utf-8');
        count++;
        console.log('Fixed: ' + p);
      }
    }
  }
  walk(d);
}
console.log('Total: ' + count);
