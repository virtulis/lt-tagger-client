import { UserInterface } from '../cli';
import * as minimist from 'minimist';
import * as xmldom from 'xmldom';

export interface GrepOptions {
	unparsedWords: boolean;
	withUnparsedWords: boolean;
}

export function parseGrepOptions(mm: minimist.ParsedArgs): GrepOptions {
	return {
		unparsedWords: !!mm['unparsed-words'],
		withUnparsedWords: !!mm['with-unparsed-words'],
	};
}

export function grep(xmls: string, opts: GrepOptions, ui: UserInterface) {

	const parser = new xmldom.DOMParser();
	const ixml = parser.parseFromString(xmls);
	const idoc = ixml.documentElement;

	const oxml = parser.parseFromString('<?xml version="1.0" encoding="utf-8"?>\n<grep-output />\n');
	const odoc = oxml.documentElement;

	const elements = (node: Node, tag?: string) => Array.from(node.childNodes)
		.filter(cn => cn.nodeType == ELEMENT_NODE && (!tag || (cn as Element).tagName.toLowerCase() == tag)) as Element[];
	const append = (p: Node | false | null | undefined, c: Node, indent: number) => {
		if (!p) return;
		if (!p.childNodes.length) p.appendChild(oxml.createTextNode('\n\t'));
		p.appendChild(oxml.createTextNode('\t'.repeat(indent > 1 ? indent - 1 : indent)));
		p.appendChild(c); // kill me
		p.appendChild(oxml.createTextNode(indent > 1 ? '\n\t' : '\n'));
		return c;
	};
	const section = (tag: string) => append(odoc, oxml.createElement(tag), 1);

	odoc.appendChild(oxml.createTextNode('\n'));
	const unparsedWords = opts.unparsedWords && section('unparsed-words');
	const withUnparsedWords = opts.withUnparsedWords && section('with-unparsed-words');

	const ELEMENT_NODE = idoc.ELEMENT_NODE;

	const ctr = elements(idoc, 'body')[0];

	for (let para of elements(ctr, 'para')) {

		const pid = para.getAttribute('id') || '';

		for (let se of elements(para, 'se')) {

			if (se.getAttribute('lang') == 'ru') continue;
			// se.setAttribute('para-id', pid);

			let foundUnparsed = false;

			for (let w of elements(se, 'w')) {
				if (elements(w, 'ana').find(ana => ana.getAttribute('gr') == '=')) {
					foundUnparsed = true;
					append(unparsedWords, w.cloneNode(true), 2);
				}
			}

			if (foundUnparsed) append(withUnparsedWords, se.cloneNode(true), 2);

		}

	}

	return oxml;

}
