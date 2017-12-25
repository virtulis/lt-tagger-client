export const attributes: { [key: string]: [string, string] } = {
	
	// lt
	"KLC tag": ["RNC tag", null],
	"dkt.": ["S", null],
	"bdv.": ["A", null],
	"sktv.": ["ADJ", null],
	"įv.": ["PRO", null],
	"vksm.": ["V", null],
	"prv.": ["ADV", null],
	"jst.": ["INTJ", null],
	"išt.": ["INTJ2", null],
	"dll.": ["partcp", null],
	"prl.": ["PR", null],
	"jng.": ["CONJ", null],
	"akronim.": ["abbr", null],
	"sutr.": ["abbr", null],
	"tikr.": ["S,propn", null],
	"tikr. dkt.": ["S,propn", null],
	
	
	
	// rt, -> V(lt)
	"bendr.": ["V", "inf"],
	"dlv.": ["V", "partcp"],
	"pad.": ["V", "partcp,ger,ssubj"],
	"pusd.": ["V", "partcp,ger,dsubj"],
	"būdn.": ["V", "partcp,ger,manner"],
	"tiesiog. n.": ["V", "indic"],
	"liep. n.": ["V", "imper"],
	"tar. n.": ["V", "cond"],
	
	
	"kiek.": ["NUM,card", null],
	"kelint.": ["ANUM,ord", null],
	"daugin.": ["NUM,mult", null],
	"kuopin.": ["NUM,collect", null],
	
	"įvardž.": [null, "def"],
	"neįvardž.": [null, "indef"],
	
	"sngr.": ["refl", null],
	"nesngr.": ["nrefl", null],
	
	"veik. r.": [null, "act"],
	"neveik. r.": [null, "pass"],
	"reik.": [null, "debit"],
	"es. l.": [null, "praes"],
	"būt. l.": [null, "praet"],
	"būt. k. l.": [null, "praet"],
	"būt. d. l.": [null, "praet,hab"],
	"būs. l.": [null, "fut"],

	"nelygin. l.": [null, "pos"],
	"aukšt. l.": [null, "comp"],
	"aukšč. l.": [null, "super"],
	"mot. g.": [null, "f"],
	"vyr. g.": [null, "m"],
	"bev. g.": [null, "n"],
	"bendr. g.": [null, "mf"],
	"vns.": [null, "sg"],
	"dgs.": [null, "pl"],
	"dvisk.": [null, "du"],
	"V.": [null, "nom"],
	"K.": [null, "gen"],
	"N.": [null, "dat"],
	"G.": [null, "acc"],
	"Įn.": [null, "ins"],
	"Vt.": [null, "loc"],
	"Š.": [null, "voc"],
	"Il.": [null, "ill"],
	"1 asm.": [null, "1p"],
	"2 asm.": [null, "2p"],
	"3 asm.": [null, "3p"],

	"neig.": [null, "neg"],
	"rom. sk.": ["ciph", null],
	"idprl.": ["PR,fixed", null],
	"idjngt.": ["CONJ,fixed", null],
	"idPS": ["PS,fixed", null],
	
	"teig.": [null, null],
	"nežinomas": [null, null],

};