import * as xmldom from 'xmldom';
import chalk from 'chalk';

import { tagString, TekstynasOptions, TekstynasTag } from './tekstynas';
import { attributes } from './rnc-data';
import { charmap, mapChars } from './charmap';
import { UserInterface } from '../cli';

const batch = 10;

type TagSet = { [key: string]: true };

export interface RNCOptions extends TekstynasOptions {
	from: number;
	salvage: boolean;
}

export async function processRNC(xmls: string, options: RNCOptions, ui: UserInterface) {

	const parser = new xmldom.DOMParser();
	const xml = parser.parseFromString(xmls);
	const doc = xml.documentElement;

	async function tagSentences(ses: Element[]) {

		const istr = ses.map(se => mapChars((se.textContent || '').trim()).join('')).join('\n');

		const tags = await tagString(istr, options);

		let sei = 0;
		let cse: Element | void;
		let cstr = '';
		let cstri = 0;
		let hadSpace = true;
		let mapi = 0;
		let ccs: Node[] = [];

		const save = () => {
			if (!cse) return;
			for (let cn of Array.from(cse.childNodes)) cse.removeChild(cn);
			for (let cc of ccs) cse.appendChild(cc);
			ccs = [];
		};

		const next = () => {
			save();
			cse = ses[sei++];
			cstr = (cse && cse.textContent || '').trim();
			//console.log('\t' + cstr);
			cstri = 0;
			hadSpace = true; // prevent ws at str start
		};

		for (let tag of tags) {

			if (!cse || cstri >= cstr.length) next();

			if (tag.type == 'space') {
				while (cstr[cstri].match(/\s/)) cstri++;
				if (hadSpace) continue;
				ccs.push(xml.createTextNode(' '));
				hadSpace = true;
				continue;
			}

			const ttxt = tag.content!;

			if (!ttxt) {
				console.log('Empty tag:', tag);
				continue;
			}

			const ttlen = ttxt.length;
			let found = false;
			let flen = 0;
			let i = cstri;
			let l = cstr.length - ttlen + 1;
			for (; cse; i++) {

				if (i >= l) {
					console.log(chalk.yellow('Remained:'), cstr.substr(cstri));
					next();
					if (!cse) break;
					i = cstri; // 0
					l = cstr.length - ttlen + 1;
				}

				const sub = cstr.substr(i, ttlen);

				if (sub == ttxt) {
					found = true;
					flen = sub.length;
					break;
				}

				const map = charmap[sub[0]];
				if (map && map[mapi] == ttxt) {
					found = true;
					const last = ++mapi == map.length;
					flen = last ? 1 : 0;
					if (last) mapi = 0;
					break;
				}

				mapi = 0;

			}

			if (!found) {
				console.log(chalk.red('Failed to match:'), tag);
				console.log('To:', cstr);
				console.log('At:', cstri, '=', cstr.substr(cstri, 10));
				throw new Error('Tag mapping failed');
			}

			if (i > cstri) {
				const miss = cstr.substring(cstri, i);
				console.log('Jumped over:', miss);
				ccs.push(xml.createTextNode(miss));
				hadSpace = false;
			}

			cstri = i + flen;

			if (tag.type == 'sep' || tag.type == 'number') {
				ccs.push(xml.createTextNode(ttxt));
				hadSpace = false;
				continue;
			}

			if (tag.type == 'ambiguous' && !tag.variants!.length) {
				console.log(chalk.yellow('Empty ambig:'), tag);
			}

			if (!hadSpace) ccs.push(xml.createTextNode(' '));

			const w = xml.createElement('w');

			const vars = tag.type == 'ambiguous' ? tag.variants || [] : [tag];
			for (let vtag of vars) {

				const pidx = vtag.lemma!.indexOf('(');
				const lex = pidx > 0 ? vtag.lemma!.substr(0, pidx) : vtag.lemma!;

				let left: TagSet = {}, right: TagSet = {};
				for (let tt of vtag.properties!) {
					const mtt = attributes[tt] || attributes[tt + '.'];
					if (!mtt) {
						console.log(chalk.yellow('Bad type:'), tt);
						console.log('In:', vtag);
						continue;
					}
					const [l, r] = mtt;
					if (l) for (let stt of l.split(',')) left[stt] = true;
					if (r) for (let stt of r.split(',')) right[stt] = true;
				}
				const gr = Object.keys(left).join(',') + '=' + Object.keys(right).join(',');

				const ana = xml.createElement('ana');
				ana.setAttribute('lex', lex);
				ana.setAttribute('gr', gr);
				w.appendChild(ana);

			}

			w.appendChild(xml.createTextNode(ttxt));
			ccs.push(w);

			hadSpace = false;

		}
		save();

	}

	const xtag = (el: Element, tag: string) => Array.from(el.childNodes).filter(cn => (cn as Element).tagName == tag) as Element[];
	let ses: Element[] = [];
	for (let para of xtag(xtag(doc, 'body')[0], 'para')) {
		for (let se of Array.from(para.childNodes) as Element[]) {
			if (se.tagName != 'se' || se.getAttribute('lang') == 'ru') continue;
			ses.push(se);
		}
	}

	for (let i = options.from, l = ses.length; i < l; i += batch) {
		console.log(Math.round(i * 100 / l) + '% (' + i + '/' + l + ')');

		let stop = false;
		try {
			const slice = ses.slice(i, i + batch);
			for (let se of slice) {
				if (se.childNodes.length > 1) console.log(chalk.yellow('Retagging:'), se.textContent!.trim());
			}
			await tagSentences(slice);
		}
		catch (e) {
			console.log(chalk.bold(chalk.red(e.message)));
			if (e.message != 'Tag mapping failed') console.log(e.stack);
			stop = true;
		}

		if (stop || ui.cancel) {
			console.log('Salvaging at: ' + i);
			break;
		}

	}

	const serializer = new xmldom.XMLSerializer();
	return serializer.serializeToString(xml);

}
