import * as request from 'request-promise';

import { semantikaMap, SemantikaTagMap, SemantikaTagValue } from './semantika-map';
import { Tagger } from './util';
import * as xmldom from 'xmldom';

export interface SemantikaOptions {
}

export interface SemantikaTag {
	start: number;
	length: number;
	content: string;
	variants: SemantikaTagVariant[]
}
export interface SemantikaTagVariant {
	lemma: string;
	properties: string;
}

export class SemantikaTagger implements Tagger {

	readonly options: SemantikaOptions;

	constructor(options: SemantikaOptions) {
		this.options = options;
	}

	async fetchTags(str: string) {

		const json = await request('http://semantika.lt/SyntaticAndSemanticAnalysis/Analysis/Analyze', {
			method: 'POST',
			form: {
				Text: str,
				Morphology: true,
				Collocations: false,
				NamedEntities: false,
				Spelling: false,
				Grammar: false,
				Syntax: false,
			}
		});
		const res = JSON.parse(json);

		const tags: SemantikaTag[] = [];
		
		if (!res.lex) {
			console.log('Invalid response from Semantika', res);
			return;
		}
		
		const segs = res.lex.seg as [number, number][];
		const msds = res.morphology.msd as [string, string][][];

		return segs.map((seg, i) => <SemantikaTag> {
			start: seg[0],
			length: seg[1],
			content: str.substr(...seg),
			variants: msds[i].map(vd => ({
				lemma: vd[0],
				properties: vd[1],
			}))
		});

	}

	async tagRNCSentences(ses: Element[], xml: Document) {

		const text = ses.map(se => (se.textContent || '').trim()).join('\n');

		const tags = await this.fetchTags(text);

		let tpos = 0;
		let stpos = 0;
		let nstpos = 0;

		let sei = 0;
		let cse: Element | void;
		let cstr = '';
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
			cstr = (cse && cse.textContent || '');
			stpos = nstpos;
			nstpos += cstr.trim().length + 1; // \n
		};

		const pushText = (s: string) => ccs.push(xml.createTextNode(s));
		
		if (!tags) return;
		
		for (let tag of tags) {

			if (tag.start + tag.length >= nstpos) {
				pushText(text.slice(tpos, Math.max(nstpos - 1, 0)));
				next(); // nstpos -> stpos
				pushText(text.slice(stpos, tag.start));
			}
			else if (tag.start > tpos) {
				pushText(text.slice(tpos, tag.start));
			}

			const tct = text.substr(tag.start, tag.length);
			const sct = cstr.substr(tag.start - stpos, tag.length);
			if (tct != tag.content || sct != tag.content) console.log(
				'DRIFTED?',
				stpos,
				nstpos,
				tpos,
				tag.start - stpos,
				tag.start,
				tag.length,
				tag.content,
				tct,
				sct,
			);

			tpos = tag.start + tag.length;

			if (tag.variants.length == 1 && tag.variants[0].properties[0] == 'T') { // punct
				pushText(tag.content);
				continue;
			}

			const w = xml.createElement('w');

			for (let vtag of tag.variants) {

				const left = {} as Record<string, true>;
				const right = {} as Record<string, true>;
				function add(from: string | undefined, to: Record<string, true>) {
					if (from && from.length) from.split(',').forEach(t => to[t] = true);
				}
				for (let mtag of this.parseDLKT(vtag.properties, tag)) {
					add(mtag.rncLeft, left);
					add(mtag.rncRight, right);
				}

				const ana = xml.createElement('ana');
				ana.setAttribute('lex', vtag.lemma);
				ana.setAttribute('gr', Object.keys(left).join(',') + '=' + Object.keys(right).join(','));
				w.appendChild(ana);

			}

			w.appendChild(xml.createTextNode(tag.content));
			ccs.push(w);

		}

		save();

	}

	async tagSimpleSentencesWithRNC(input: string) {

		const parser = new xmldom.DOMParser();
		const xml = parser.parseFromString(`<?xml version="1.0" encoding="utf-8"?><html><head></head><body></body></html>`);
		const doc = xml.documentElement;
		const body = doc.childNodes[1];
		
		let pid = 0;
		
		const lines = input.split('\n').map(s => s.trim()).filter(s => !!s);
		for (let line of lines) {
			
			const tags = await this.fetchTags(line);
			
			const para = xml.createElement('para');
			para.setAttribute('id', String(pid++));
			
			const se = xml.createElement('se');
			se.setAttribute('lang', 'lt');

			para.appendChild(se);
			body.appendChild(xml.createTextNode('\n'));
			body.appendChild(para);
			
			if (!tags) {
				se.appendChild(xml.createTextNode(line));
				continue;
			}
			
			let rl = line;
			for (let tag of tags) {
				
				const idx = rl.indexOf(tag.content);
				if (idx < 0) throw new Error('Content mismatch');
				const wsp = rl.slice(0, idx);
				rl = rl.slice(idx + tag.content.length);
				
				if (wsp) se.appendChild(xml.createTextNode(wsp));

				if (tag.variants.length == 1 && tag.variants[0].properties[0] == 'T') { // punct
					se.appendChild(xml.createTextNode(tag.content));
					continue;
				}

				const w = xml.createElement('w');
				
				for (let vtag of tag.variants) {

					const left = {} as Record<string, true>;
					const right = {} as Record<string, true>;

					function add(from: string | undefined, to: Record<string, true>) {
						if (from && from.length) from.split(',').forEach(t => to[t] = true);
					}

					for (let mtag of this.parseDLKT(vtag.properties, tag)) {
						add(mtag.rncLeft, left);
						add(mtag.rncRight, right);
					}

					const ana = xml.createElement('ana');
					ana.setAttribute('lex', vtag.lemma);
					ana.setAttribute('gr', Object.keys(left).join(',') + '=' + Object.keys(right).join(','));
					w.appendChild(ana);

				}

				w.appendChild(xml.createTextNode(tag.content));
				se.appendChild(w);
				
			}
			
		}

		body.appendChild(xml.createTextNode('\n'));
		
		return xml;
		
	}

	parseDLKT(dlkt: string, src?: SemantikaTag) {

		if (dlkt[0] == 'X') return [];

		const tags = <SemantikaTagValue[]> [];
		let map: null | SemantikaTagMap = null;

		for (let i = 0; i < dlkt.length; i++) {

			const char = dlkt[i];
			if (!i) map = semantikaMap[char];
			if (!map) {
				console.log('Unknown DLKT type', char, 'in', JSON.stringify(src, null, '  '));
				break;
			}

			if (!map[i + 1]) {
				console.log('Unknown pos', i + 1, 'in', dlkt, 'of', JSON.stringify(src, null, '  '));
				continue;
			}
			const tag = map[i + 1][char];
			if (!tag && char != '-') {
				console.log('Unknown value', char, 'for pos', i + 1, 'in', dlkt, 'of', JSON.stringify(src, null, '  '));
				continue;
			}

			if (tag) tags.push(tag);

		}

		return tags;

	}

}
