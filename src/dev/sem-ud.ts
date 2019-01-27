import { readFileSync } from 'fs';
import { resolve } from 'path';
import { SemantikaTagMap, SemantikaTagValue } from '../semantika-map';

const lines = readFileSync(resolve(__dirname, 'sem-ud.md'), 'utf-8').split(/\r?\n/g);

const out = <Record<string, SemantikaTagMap>> {};
let cur: SemantikaTagMap | null = null;

for (let line of lines) {

	if (line.match(/^### /)) {
		cur = {};
		continue;
	}
	if (!line.trim().length && cur && cur[1]) {
		const fval = Object.keys(cur[1]);
		if (fval.length != 1) throw new Error('shta? ' + JSON.stringify(fval));
		out[fval[0]] = cur;
		cur = null;
	}
	if (!cur) continue;

	const cols = line.trim().split('|');
	if (cols.length < 5) continue;

	const [idxs, char, val, cmt] = cols.slice(2);
	const idx = parseInt(idxs);
	if (!isFinite(idx) || !char.trim()) continue;

	// console.log(idx, char, val, cmt);
	const tag = <SemantikaTagValue> {};
	if (cmt.trim()) tag.mdComment = cmt.trim();

	const [udk, udv] = val.split('=').filter(s => !!s.trim());
	if (udv) {
		tag.udKey = udk;
		tag.udValue = udv;
	}
	else if (udk) {
		tag.udPOS = udk;
	}

	if (!cur[idx]) cur[idx] = {};
	if (cur[idx][char]) throw new Error('wat? ' + line);
	cur[idx][char] = tag;

}

console.log(JSON.stringify(out, null, '\t'));
