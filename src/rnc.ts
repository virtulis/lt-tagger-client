import * as xmldom from 'xmldom';
import chalk from 'chalk';

import { UserInterface } from '../cli';
import { Tagger } from './util';

const batch = 10;

export type RNCTagSet = { [key: string]: true };

export interface RNCOptions {
	from: number;
	salvage: boolean;
}

export async function processRNC(xmls: string, options: RNCOptions, tagger: Tagger, ui: UserInterface) {

	const parser = new xmldom.DOMParser();
	const xml = parser.parseFromString(xmls);
	const doc = xml.documentElement;

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
			await tagger.tagRNCSentences(slice, xml);
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
