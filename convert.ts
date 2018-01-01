import * as xmldom from 'xmldom';
import * as request from 'request-promise';
import * as entities from 'html-entities';

import { attributes } from './translate';

type TagSet = { [key: string]: true };

export async function convert(input: string) {
	
	const parser = new xmldom.DOMParser();
	const xml = parser.parseFromString(input);
	const doc = xml.documentElement;
	
	let ses: Element[] = [];
	
	const edec = new entities.AllHtmlEntities();
	
	async function tag() {
		
		const txt = ses.map(se => se.textContent.trim()).join('\n');
		//console.log(txt);
		
		const rbody = await request('http://donelaitis.vdu.lt/main_helper.php?id=4&nr=7_2', {
			method: 'POST',
			form: {
				tekstas: txt,
				tipas: 'lemuoti',
				pateikti: 'LM',
				veiksmas: 'Rezultatas puslapyje',
			}
		});
		
		const rxmls = edec.decode(rbody.substr(rbody.indexOf('</form>') + 7));
		//console.log(rxmls);
		
		let rem = '';
		let se: Element;
		const eat = (len: number) => {
			rem = rem.substr(len).trim();
			while (rem[0] == '—') rem = rem.substr(1).trim(); // — — —
			while (!rem.length) {
				if (!ses.length) return;
				se = ses.shift();
				rem = se.textContent.trim();
				for (let node of Array.from(se.childNodes)) {
					se.removeChild(node);
				}
			}
		};
		eat(0);
		let ambig = false;
		let aword: string;
		let aw: Element;
		for (let line of rxmls.split('\n')) {
			console.log('\t', line);
			let match: RegExpMatchArray;
			if (match = line.match(/^<sep="(.)"/)) {
				const sep = match[1];
				if (rem[0] != sep) {
					console.log('bad sep', sep, 'expected', rem.substr(0, 3) + '...');
					const widx = rem.indexOf(sep);
					if (widx > 0) eat(widx);
					else if (!rem.match(/\w/)) eat(rem.length);
					else continue;
				}
				se.appendChild(xml.createTextNode(sep));
				eat(1);
			}
			else if (line.match(/^<space/)) {
				if (se.childNodes.length) se.appendChild(xml.createTextNode(' '));
			}
			else if (match = line.match(/<word="(.*?)".*? lemma="(.*?)".*? type="(.*?)".*?\/>/)) {
				const [mstr, word, lemma, type] = match;
				if (rem.indexOf(word) !== 0) {
					console.log('bad word', word, 'expected', rem.substr(0, 3) + '...');
					const widx = rem.indexOf(word);
					if (widx > 0) eat(widx);
					else if (!rem.match(/\w/)) eat(rem.length);
					else continue;
				}
				
				const pidx = lemma.indexOf('(');
				const lex = pidx > 0 ? lemma.substr(0, pidx) : lemma;
				
				let left: TagSet = {}, right: TagSet = {};
				for (let tts of type.split(',')) {
					const tt = tts.trim();
					const mtt = attributes[tt] || attributes[tt + '.'];
					if (!mtt) {
						console.log('bad type', tt.trim());
						continue;
					}
					if (mtt[0]) for (let stt of mtt[0].split(',')) left[stt] = true;
					if (mtt[1]) for (let stt of mtt[1].split(',')) right[stt] = true;
				}
				const gr = Object.keys(left).join(',') + '=' + Object.keys(right).join(',');
				
				const w = xml.createElement('w');
				
				const ana = xml.createElement('ana');
				ana.setAttribute('lex', lex);
				ana.setAttribute('gr', gr);
				
				if (!ambig) {
					w.appendChild(ana);
					w.appendChild(xml.createTextNode(word));
					se.appendChild(w);
					eat(word.length);
				}
				else {
					aword = word;
					aw.appendChild(ana);
				}
			}
			else if (line.match(/^<ambig/)) {
				ambig = true;
				aword = null;
				aw = xml.createElement('w');
			}
			else if (line.match(/^<\/ambig/)) {
				if (!aword) console.log('empty ambig?');
				aw.appendChild(xml.createTextNode(aword));
				se.appendChild(aw);
				eat(aword.length);
				ambig = false;
			}
			else if (match = line.match(/^<number="(\d+)/)) {
				if (rem.indexOf(match[1]) == 0) {
					se.appendChild(xml.createTextNode(match[1]));
					eat(match[1].length);
				}
				else {
					console.log('bad number', match[1], 'expected', rem.substr(0, 3) + '...');
				}
			}
			
		}
		
	}
	
	const xtag = (el: Element, tag: string) => Array.from(el.childNodes).filter(cn => (cn as Element).tagName == tag) as Element[];
	
	for (let para of xtag(xtag(doc, 'body')[0], 'para')) {
		for (let se of Array.from(para.childNodes) as Element[]) {
			if (se.tagName != 'se' || se.getAttribute('lang') == 'ru') continue;
			ses.push(se);
			if (ses.length >= 10) {
				await tag();
				ses = [];
			}
		}
	}
	
	const serializer = new xmldom.XMLSerializer();
	return serializer.serializeToString(xml);
	
}