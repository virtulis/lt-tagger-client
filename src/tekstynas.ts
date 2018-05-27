import * as request from 'request-promise';
import * as entities from 'html-entities';

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

export async function tagString(str: string, options: TekstynasOptions) {

	const rbody = await request('http://donelaitis.vdu.lt/main_helper.php?id=4&nr=7_2', {
		method: 'POST',
		form: {
			tekstas: str,
			tipas: options.single ? 'anotuoti' : 'lemuoti',
			pateikti: 'LM',
			veiksmas: 'Rezultatas puslapyje',
		}
	});

	const rxmls = edec.decode(rbody.substr(rbody.indexOf('</form>') + 7));

	const tags: TekstynasTag[] = [];

	let atag: TekstynasTag | null = null;
	for (let line of rxmls.split('\n')) {

		let match: RegExpMatchArray | null;

		if (match = line.match(/^<sep="(.)"/)) {
			tags.push({ type: 'sep', content: match[1] })
		}
		else if (line.match(/^<space/)) {
			tags.push({ type: 'space' });
		}
		else if (match = line.match(/<word="(.*?)".*? lemma="(.*?)".*? type="(.*?)".*?\/>/)) {
			const [content, lemma, propstr] = match.slice(1);
			const properties = propstr.split(',').map(p => p.trim());
			const tag: TekstynasTag = { type: 'word', content, lemma, properties };
			if (atag) {
				atag.content = content;
				atag.variants!.push(tag)
			}
			else {
				tags.push(tag);
			}
		}
		else if (line.match(/^<ambig/)) {
			atag = { type: 'ambiguous', variants: [] };
		}
		else if (line.match(/^<\/ambig/)) {
			tags.push(atag!);
			atag = null;
		}
		else if (match = line.match(/^<number="(\d+)/)) {
			tags.push({ type: 'number', content: match[1] });
		}

	}

	return tags;

}
