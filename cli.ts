import * as sms from 'source-map-support';
sms.install();

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as minimist from 'minimist';
import chalk from 'chalk';

import { processRNC } from './src/rnc';
import { existsSync } from 'fs';
import { grep, parseGrepOptions } from './src/grep';
import { TekstynasTagger } from './src/tekstynas';
import { SemantikaTagger } from './src/semantika';

function cuteWords(bold: string, under: string | null = null) {
	return bold.split(/\s+/g).map(s => chalk.bold(s))
		.concat(under && under.split(/\s+/g).map(s => chalk.underline(s)) || [])
		.join(' ');
}

const usage = `${chalk.bold('Usage:')}

	${cuteWords('node cli rnc', 'tagger [opts] in.xml outdir|out.xml')}
		--single -> no ambigs
		--salvage -> save in case of error
		--from=N -> start at sentence N (eg after salvage)
		
	${cuteWords('node cli grep', '[opts] in.xml outdir|out.xml')}
	filters:
		--unparsed-words -> dump unparsed words (no sentence structure)
		--with-unparsed-words -> dump sentences with unparsed words
		
${chalk.bold('Taggers:')}

	tekstynas
	semantika
	
`;

export interface UserInterface {
	cancel: boolean;
}

function getTagger(tid: string, mm: minimist.ParsedArgs) {
	if (tid == 'tekstynas') return new TekstynasTagger({
		single: mm.single
	});
	if (tid == 'semantika') return new SemantikaTagger({
		// single: mm.single
	});
}

function getEffectiveFilenames([ifn, ofn]: string[], salvage = false) {
	const eofn = (fs.existsSync(ofn) && fs.statSync(ofn).isDirectory()) ? ofn + '/'  + path.basename(ifn) : ofn;
	const eifn = salvage && existsSync(eofn) ? eofn : ifn;
	return [eifn, eofn];
}

(async function cli() {
	
	const mm = minimist(process.argv.slice(2), {
		boolean: true,
	});

	if (!mm._.length || mm.help || mm.h || mm['?']) {
		console.log(usage);
		return;
	}

	const cmd = mm._[0];

	const ui = { cancel: false };

	process.on('SIGINT', () => {
		if (ui.cancel) {
			console.log('\nEmergrency abort');
			process.exit(os.constants.signals.SIGINT);
		}
		console.log('\nReceived Ctrl+C');
		ui.cancel = true;
	});

	const done = () => process.exit(ui.cancel ? os.constants.signals.SIGINT : 0);

	if (cmd == 'rnc') {

		const tid = mm._[1];
		const tagger = getTagger(tid, mm);
		if (!tagger) {
			console.log(chalk.red('Unknown tagger'), tid);
			console.log('\n' + usage);
			return process.exit(1);
		}

		const salvage = mm.salvage;
		const from = isFinite(parseInt(mm.from)) ? parseInt(mm.from) : 0;

		const [eifn, eofn] = getEffectiveFilenames(mm._.slice(2));
		if (eifn == eofn) console.log(chalk.yellow('Salvaging:', eofn));

		const ixml = fs.readFileSync(eifn, { encoding: 'utf-8' });
		const rxml = await processRNC(ixml, { salvage, from }, tagger, ui);
		if (rxml) fs.writeFileSync(eofn, rxml);

		return done();

	}

	if (cmd == 'grep') {

		const [eifn, eofn] = getEffectiveFilenames(mm._.slice(1));
		const opts = parseGrepOptions(mm);

		const ixml = fs.readFileSync(eifn, { encoding: 'utf-8' });
		const rxml = await grep(ixml, parseGrepOptions(mm), ui);
		if (rxml) fs.writeFileSync(eofn, rxml);

		return done();

	}

	console.log(chalk.red('Unknown command'), cmd);
	console.log('\n' + usage);

	process.exit(1);

})();
