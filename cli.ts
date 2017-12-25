import * as fs from 'fs';
import { convert } from './convert';
import * as path from 'path';

(async function cli() {
	
	let [ifn, ofn] = process.argv.slice(2);
	const str = fs.readFileSync(ifn, { encoding: 'utf-8' });
	
	const out = await convert(str);
	
	if (fs.existsSync(ofn) && fs.statSync(ofn).isDirectory()) ofn += '/'  + path.basename(ifn);
	fs.writeFileSync(ofn, out);
	
})();