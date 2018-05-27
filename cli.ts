import * as sms from 'source-map-support';
sms.install();

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as minimist from 'minimist';
import chalk from 'chalk';

import { processRNC } from './src/rnc';
import { existsSync } from 'fs';

const usage = `Usage:

	node cli rnc [opts] in.xml outdir|out.xml
		-s|--single -> no ambigs
		-S|--salvage -> save in case of error
		--from N -> start at sentence N (eg after salvage)
	
`;

export interface UserInterface {
	cancel: boolean;
}

(async function cli() {
	
	const mm = minimist(process.argv.slice(2), {
		boolean: ['single', 's', 'S', 'salvage'],
	});

	if (!mm._.length || mm.help || mm.h || mm['?']) {
		console.log(usage);
		return;
	}

	const [cmd, ifn, ofn] = mm._;

	const single = mm.single || mm.s;
	const salvage = mm.salvage || mm.S;
	const from = isFinite(parseInt(mm.from)) ? parseInt(mm.from) : 0;

	const eofn = (fs.existsSync(ofn) && fs.statSync(ofn).isDirectory()) ? ofn + '/'  + path.basename(ifn) : ofn;
	const eifn = salvage && existsSync(eofn) ? eofn : ifn;

	const ui = { cancel: false };

	process.on('SIGINT', () => {
		if (ui.cancel) {
			console.log('\nEmergrency abort');
			process.exit(os.constants.signals.SIGINT);
		}
		console.log('\nReceived Ctrl+C');
		ui.cancel = true;
	});

	if (cmd == 'rnc') {
		if (eifn == eofn) console.log(chalk.yellow('Salvaging:', eofn));
		const ixml = fs.readFileSync(eifn, { encoding: 'utf-8' });
		const rxml = await processRNC(ixml, { single, salvage, from }, ui);
		if (rxml) fs.writeFileSync(eofn, rxml);
	}
	else {
		console.log(chalk.red('Unknown command'), cmd);
		console.log('\n' + usage);
	}

	process.exit(ui.cancel ? os.constants.signals.SIGINT : 0);

})();