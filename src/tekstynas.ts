import * as request from 'request-promise';
import * as entities from 'html-entities';
import { tekstynasCharmap, mapTekstynasChars } from './tekstynas-charmap';
import chalk from 'chalk';
import { tekstynasRNCMap } from './rnc-tekstynas-map';
import { RNCTagSet } from './rnc';
import { Tagger } from './util';

const edec = new entities.AllHtmlEntities();

export interface TekstynasOptions {
	single?: boolean;
}

export interface TekstynasTag {
	type: 'sep' | 'space' | 'word' | 'ambiguous' | 'number';
	content?: string;
	lemma?: string;
	properties?: string[];
	variants?: TekstynasTag[]
}

export class TekstynasTagger implements Tagger {

	readonly options: TekstynasOptions;

	constructor(options: TekstynasOptions) {
		this.options = options;
	}

	async fetchTags(str: string) {

		const rbody = await request('http://donelaitis.vdu.lt/main_helper.php?id=4&nr=7_2', {
			method: 'POST',
			form: {
				tekstas: str,
				tipas: this.options.single ? 'anotuoti' : 'lemuoti',
				pateikti: 'LM',
				veiksmas: 'Rezultatas puslapyje',
			}
		});

		const rxmls = edec.decode(rbody.substr(rbody.indexOf('</form>') + 7));

		const tags: TekstynasTag[] = [];

		let atag: TekstynasTag | null = null;
		for (let line of rxmls.split('\n')) {

			let match: RegExpMatchArray | null;

			if (!!(match = line.match(/^<sep="(.)"/))) {
				tags.push({ type: 'sep', content: match[1] })
			} else if (line.match(/^<space/)) {
				tags.push({ type: 'space' });
			} else if (!!(match = line.match(/<word="(.*?)".*? lemma="(.*?)".*? type="(.*?)".*?\/>/))) {
				const [content, lemma, propstr] = match.slice(1);
				const properties = propstr.split(',').map(p => p.trim());
				const tag: TekstynasTag = { type: 'word', content, lemma, properties };
				if (atag) {
					atag.content = content;
					atag.variants!.push(tag)
				} else {
					tags.push(tag);
				}
			} else if (line.match(/^<ambig/)) {
				atag = { type: 'ambiguous', variants: [] };
			} else if (line.match(/^<\/ambig/)) {
				tags.push(atag!);
				atag = null;
			} else if (!!(match = line.match(/^<number="(\d+)/))) {
				tags.push({ type: 'number', content: match[1] });
			}

		}

		return tags;

	}

	async tagRNCSentences(ses: Element[], xml: Document) {

		const istr = ses.map(se => mapTekstynasChars((se.textContent || '').trim()).join('')).join('\n');

		const tags = await this.fetchTags(istr);

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
				while (cstri < cstr.length && cstr[cstri].match(/\s/)) cstri++;
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

			const ttws = ttxt.split(/\s+/g);
			for (let ttwi = 0; ttwi < ttws.length; ttwi++) {

				const ttw = ttws[ttwi];
				const ttlen = ttw.length;
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

					if (sub == ttw) {
						found = true;
						flen = sub.length;
						break;
					}

					const map = tekstynasCharmap[sub[0]];
					if (map && map[mapi] == ttw) {
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

				if (i > cstri && !ttwi) {
					const miss = cstr.substring(cstri, i);
					if (!miss.match(/^\s+$/)) console.log('Jumped over:', miss);
					ccs.push(xml.createTextNode(miss));
					hadSpace = false;
				}

				cstri = i + flen;

			}

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

				let left: RNCTagSet = {}, right: RNCTagSet = {};
				for (let tt of vtag.properties!) {
					const mtt = tekstynasRNCMap[tt] || tekstynasRNCMap[tt + '.'];
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

}
