export type SemantikaTagMap = Record<number, Record<string, SemantikaTagValue>>;
export interface SemantikaTagValue {
	udPOS?: string;
	udKey?: string;
	udValue?: string;
	rncLeft?: string;
	rncRight?: string;
	mdComment?: string;
}

const cases = {
	n: {
		mdComment: "nominative",
		rncRight: "nom",
		udKey: "Case",
		udValue: "Nom"
	},
	g: {
		mdComment: "genitive",
		rncRight: "gen",
		udKey: "Case",
		udValue: "Gen"
	},
	d: {
		mdComment: "dative",
		rncRight: "dat",
		udKey: "Case",
		udValue: "Dat"
	},
	a: {
		mdComment: "accusative",
		rncRight: "acc",
		udKey: "Case",
		udValue: "Acc"
	},
	i: {
		mdComment: "instrumental",
		rncRight: "ins",
		udKey: "Case",
		udValue: "Ins"
	},
	l: {
		mdComment: "locative",
		rncRight: "loc",
		udKey: "Case",
		udValue: "Loc"
	},
	v: {
		mdComment: "vocative",
		rncRight: "voc",
		udKey: "Case",
		udValue: "Voc"
	},
	x: {
		mdComment: "illative",
		rncRight: "ill",
		udKey: "Case",
		udValue: "Ill"
	},
	"-": {
		mdComment: "irrelevant"
	}
};

export const semantikaMap = <Record<string, SemantikaTagMap>> {
	N: {
		1: {
			N: {
				mdComment: "Noun",
				rncLeft: "S",
				udPOS: "NOUN/PROPN",
			}
		},
		2: {
			c: {
				mdComment: "common",
				rncLeft: "S",
				udPOS: "NOUN"
			},
			p: {
				mdComment: "proper",
				rncLeft: "S,propn",
				udPOS: "PROPN"
			}
		},
		3: {
			c: {
				mdComment: "common",
				rncLeft: "m-f",
				udKey: "Gender",
				udValue: "Com"
			},
			f: {
				mdComment: "feminine",
				rncLeft: "f",
				udKey: "Gender",
				udValue: "Fem"
			},
			m: {
				mdComment: "masculine",
				rncLeft: "m",
				udKey: "Gender",
				udValue: "Masc"
			}
		},
		4: {
			p: {
				mdComment: "plural",
				rncRight: "pl",
				udKey: "Number",
				udValue: "Plur"
			},
			s: {
				mdComment: "singular",
				rncRight: "sg",
				udKey: "Number",
				udValue: "Sing"
			},
			d: {
				mdComment: "dual",
				rncRight: "du",
				udKey: "Number",
				udValue: "Dual"
			},
			"-": {
				mdComment: "irrelevant"
			}
		},
		5: cases,
		6: {
			y: {
				mdComment: "yes",
				udKey: "Reflex",
				udValue: "Yes"
			},
			n: {
				mdComment: "no"
			}
		},
		7: {
			f: {
				mdComment: "first name"
			},
			s: {
				mdComment: "surname"
			},
			g: {
				mdComment: "geographic name"
			},
			"-": {
				mdComment: "irrelevant"
			}
		}
	},
	V: {
		1: {
			V: {
				mdComment: "Verb",
				rncLeft: "V",
				udPOS: "VERB"
			}
		},
		2: {
			g: {
				mdComment: "general"
			}
		},
		3: {
			i: {
				mdComment: "infinitive",
				rncRight: "inf",
				udKey: "VerbForm",
				udValue: "Inf"
			},
			m: {
				mdComment: "main (finite)",
				udKey: "VerbForm",
				udValue: "Fin"
			},
			p: {
				mdComment: "particle",
				rncRight: "partcp",
				udKey: "VerbForm",
				udValue: "Part"
			},
			a: {
				mdComment: "adverbial participle",
				rncRight: "partcp,ger,dsubj",
				udKey: "VerbForm",
				udValue: "PartPad"
			},
			h: {
				mdComment: "half particle",
				rncRight: "partcp,ger,ssubj",
				udKey: "VerbForm",
				udValue: "PartPus"
			},
			s: {
				mdComment: "adverbial participle2",
				rncRight: "partcp,ger,manner",
				udKey: "VerbForm",
				udValue: "PartManner"
			}
		},
		4: {
			p: {
				mdComment: "present",
				rncRight: "praes",
				udKey: "Tense",
				udValue: "Pres"
			},
			a: {
				mdComment: "simple past",
				rncRight: "praet",
				udKey: "Tense",
				udValue: "PastSimp"
			},
			s: {
				mdComment: "past tense",
				rncRight: "praet",
				udKey: "Tense",
				udValue: "Past"
			},
			q: {
				mdComment: "past frequentative",
				rncRight: "praet,hab",
				udKey: "Tense",
				udValue: "PastIter"
			},
			f: {
				mdComment: "future",
				rncRight: "fut",
				udKey: "Tense",
				udValue: "Fut"
			}
		},
		5: {
			1: {
				mdComment: "first",
				rncRight: "1p",
				udKey: "Person",
				udValue: "1"
			},
			2: {
				mdComment: "second",
				rncRight: "2p",
				udKey: "Person",
				udValue: "2"
			},
			3: {
				mdComment: "third",
				rncRight: "3p",
				udKey: "Person",
				udValue: "3"
			}
		},
		6: {
			p: {
				mdComment: "plural",
				rncRight: "pl",
				udKey: "Number",
				udValue: "Plur"
			},
			s: {
				mdComment: "singular",
				rncRight: "sg",
				udKey: "Number",
				udValue: "Sing"
			},
			d: {
				mdComment: "dual",
				rncRight: "du",
				udKey: "Number",
				udValue: "Dual"
			}
		},
		7: {
			f: {
				mdComment: "feminine",
				rncRight: "f",
				udKey: "Gender",
				udValue: "Fem"
			},
			m: {
				mdComment: "masculine",
				rncRight: "m",
				udKey: "Gender",
				udValue: "Masc"
			},
			n: {
				mdComment: "neuter",
				rncRight: "n",
				udKey: "Gender",
				udValue: "Neut"
			},
			"-": {
				mdComment: "irrelevant"
			}
		},
		8: {
			a: {
				mdComment: "active",
				rncRight: "act",
				udKey: "Voice",
				udValue: "Act"
			},
			p: {
				mdComment: "passive",
				rncRight: "pass",
				udKey: "Voice",
				udValue: "Pass"
			},
			n: {
				mdComment: "necessity",
				rncRight: "debit",
				udKey: "Voice",
				udValue: "Necess"
			},
			"-": {
				mdComment: "irrelevant"
			}
		},
		9: {
			y: {
				mdComment: "yes",
				rncRight: "neg",
				udKey: "Polarity",
				udValue: "Neg"
			},
			n: {
				mdComment: "no",
				udKey: "Polarity",
				udValue: "Yes"
			}
		},
		10: {
			y: {
				mdComment: "yes",
				rncRight: "def",
				udKey: "Definite",
				udValue: "Def"
			},
			n: {
				mdComment: "no",
				rncRight: "indef",
				udKey: "Definite",
				udValue: "Ind"
			}
		},
		11: cases,
		12: {
			y: {
				mdComment: "yes",
				rncLeft: "refl",
				udKey: "Reflex",
				udValue: "Yes"
			},
			n: {
				mdComment: "no"
			}
		},
		13: {
			i: {
				mdComment: "indicative",
				rncRight: "indic",
				udKey: "Mood",
				udValue: "Ind"
			},
			s: {
				mdComment: "subjunctive",
				rncRight: "cond",
				udKey: "Mood",
				udValue: "Cnd"
			},
			m: {
				mdComment: "imperative",
				rncRight: "imper",
				udKey: "Mood",
				udValue: "Imp"
			},
			"-": {
				mdComment: "irrelevant"
			}
		},
		14: {
			p: {
				mdComment: "positive",
				udKey: "Degree",
				udValue: "Pos"
			},
			c: {
				mdComment: "comparative",
				rncRight: "comp",
				udKey: "Degree",
				udValue: "Cmp"
			},
			s: {
				mdComment: "superlative",
				rncRight: "super",
				udKey: "Degree",
				udValue: "Sup"
			},
			"-": {
				mdComment: "irrelevant"
			}
		}
	},
	A: {
		1: {
			A: {
				mdComment: "Adjective",
				rncLeft: "A",
				udPOS: "ADJ"
			}
		},
		2: {
			g: {
				mdComment: "general"
			}
		},
		3: {
			p: {
				mdComment: "positive",
				udKey: "Degree",
				udValue: "Pos"
			},
			c: {
				mdComment: "comparative",
				rncRight: "comp",
				udKey: "Degree",
				udValue: "Cmp"
			},
			s: {
				mdComment: "superlative",
				rncRight: "super",
				udKey: "Degree",
				udValue: "Sup"
			},
			d: {
				mdComment: "diminutive",
				rncLeft: "dim",
				udKey: "Derivation",
				udValue: "Dimin"
			},
			"-": {
				mdComment: "irrelevant"
			}
		},
		4: {
			f: {
				mdComment: "feminine",
				rncRight: "f",
				udKey: "Gender",
				udValue: "Fem"
			},
			m: {
				mdComment: "masculine",
				rncRight: "m",
				udKey: "Gender",
				udValue: "Masc"
			},
			n: {
				mdComment: "neuter",
				rncRight: "n",
				udKey: "Gender",
				udValue: "Neut"
			},
			"-": {
				mdComment: "irrelevant"
			}
		},
		5: {
			p: {
				mdComment: "plural",
				rncRight: "pl",
				udKey: "Number",
				udValue: "Plur"
			},
			s: {
				mdComment: "singular",
				rncRight: "sg",
				udKey: "Number",
				udValue: "Sing"
			},
			d: {
				mdComment: "dual",
				rncRight: "du",
				udKey: "Number",
				udValue: "Dual"
			},
			"-": {
				mdComment: "irrelevant"
			}
		},
		6: cases,
		7: {
			y: {
				mdComment: "yes",
				rncRight: "def",
				udKey: "Definite",
				udValue: "Def"
			},
			n: {
				mdComment: "no",
				rncRight: "indef",
				udKey: "Definite",
				udValue: "Ind"
			}
		}
	},
	P: {
		1: {
			P: {
				mdComment: "Pronoun",
				rncLeft: "PRO",
				udPOS: "PRON"
			}
		},
		2: {
			g: {
				mdComment: "general"
			}
		},
		3: {
			f: {
				mdComment: "feminine",
				rncRight: "f",
				udKey: "Gender",
				udValue: "Fem"
			},
			m: {
				mdComment: "masculine",
				rncRight: "m",
				udKey: "Gender",
				udValue: "Masc"
			},
			n: {
				mdComment: "neuter",
				rncRight: "n",
				udKey: "Gender",
				udValue: "Neut"
			},
			"-": {
				mdComment: "irrelevant"
			}
		},
		4: {
			p: {
				mdComment: "plural",
				rncRight: "pl",
				udKey: "Number",
				udValue: "Plur"
			},
			s: {
				mdComment: "singular",
				rncRight: "sg",
				udKey: "Number",
				udValue: "Sing"
			},
			d: {
				mdComment: "dual",
				rncRight: "du",
				udKey: "Number",
				udValue: "Dual"
			},
			"-": {
				mdComment: "irrelevant"
			}
		},
		5: cases,
		6: {
			y: {
				mdComment: "yes",
				rncRight: "def",
				udKey: "Definite",
				udValue: "Def"
			},
			n: {
				mdComment: "no",
				rncRight: "indef",
				udKey: "Definite",
				udValue: "Ind"
			},
			"-": {
				mdComment: "irrelevant"
			}
		}
	},
	M: {
		1: {
			M: {
				mdComment: "Numeral",
				rncLeft: "NUM",
				udPOS: "NUM"
			}
		},
		2: {
			c: {
				mdComment: "cardinal",
				rncRight: "card",
				udKey: "NumType",
				udValue: "Card"
			},
			o: {
				mdComment: "ordinal",
				rncLeft: "ord",
				udKey: "NumType",
				udValue: "Ord"
			},
			l: {
				mdComment: "collect",
				rncLeft: "coll",
				udKey: "NumType",
				udValue: "Sets"
			},
			m: {
				mdComment: "multiple",
				rncLeft: "mult",
				udKey: "NumType",
				udValue: "Mult"
			},
			"-": {
				mdComment: "irrelevant"
			}
		},
		3: {
			f: {
				mdComment: "feminine",
				rncRight: "f",
				udKey: "Gender",
				udValue: "Fem"
			},
			m: {
				mdComment: "masculine",
				rncRight: "m",
				udKey: "Gender",
				udValue: "Masc"
			},
			n: {
				mdComment: "neuter",
				rncRight: "n",
				udKey: "Gender",
				udValue: "Neut"
			},
			"-": {
				mdComment: "irrelevant"
			}
		},
		4: {
			p: {
				mdComment: "plural",
				rncRight: "pl",
				udKey: "Number",
				udValue: "Plur"
			},
			s: {
				mdComment: "singular",
				rncRight: "sg",
				udKey: "Number",
				udValue: "Sing"
			},
			"-": {
				mdComment: "irrelevant"
			}
		},
		5: cases,
		6: {
			d: {
				mdComment: "digit",
				rncLeft: "ciph",
				udKey: "NumForm",
				udValue: "Digit"
			},
			r: {
				mdComment: "roman",
				rncLeft: "ciph",
				udKey: "NumForm",
				udValue: "Roman"
			},
			l: {
				mdComment: "letter",
				udKey: "NumForm",
				udValue: "Letter"
			},
			m: {
				mdComment: "m-form"
			}
		},
		7: {
			y: {
				mdComment: "yes",
				rncRight: "def",
				udKey: "Definite",
				udValue: "Def"
			},
			n: {
				mdComment: "no",
				rncRight: "indef",
				udKey: "Definite",
				udValue: "Ind"
			},
			"-": {
				mdComment: "irrelevant"
			}
		}
	},
	R: {
		1: {
			R: {
				mdComment: "Adverb",
				rncLeft: "ADV",
				udPOS: "ADV"
			}
		},
		2: {
			g: {
				mdComment: "general"
			}
		},
		3: {
			p: {
				mdComment: "positive",
				udKey: "Degree",
				udValue: "Pos"
			},
			c: {
				mdComment: "comparative",
				rncRight: "comp",
				udKey: "Degree",
				udValue: "Cmp"
			},
			s: {
				mdComment: "superlative",
				rncRight: "super",
				udKey: "Degree",
				udValue: "Sup"
			},
			d: {
				mdComment: "diminutive",
				rncLeft: "dim",
				udKey: "Derivation",
				udValue: "Dimin"
			},
			"-": {
				mdComment: "irrelevant"
			}
		}
	},
	S: {
		1: {
			S: {
				mdComment: "Preposition",
				rncLeft: "PR",
				udPOS: "ADP"
			}
		},
		2: {
			g: {
				mdComment: "general"
			}
		},
		3: {
			g: {
				mdComment: "genitive",
				udKey: "Case",
				udValue: "Gen"
			},
			d: {
				mdComment: "dative",
				udKey: "Case",
				udValue: "Dat"
			},
			a: {
				mdComment: "accusative",
				udKey: "Case",
				udValue: "Acc"
			},
			i: {
				mdComment: "instrumental",
				udKey: "Case",
				udValue: "Ins"
			}
		}
	},
	C: {
		1: {
			C: {
				mdComment: "Conjunction",
				rncLeft: "CONJ",
				udPOS: "CCONJ/SCONJ"
			}
		},
		2: {
			g: {
				mdComment: "general"
			}
		}
	},
	Q: {
		1: {
			Q: {
				mdComment: "Particle",
				rncLeft: "PART",
				udPOS: "PART"
			}
		},
		2: {
			g: {
				mdComment: "general"
			}
		}
	},
	I: {
		1: {
			I: {
				mdComment: "Interjection",
				rncLeft: "INTJ",
				udPOS: "INTJ"
			}
		},
		2: {
			g: {
				mdComment: "general"
			}
		}
	},
	O: {
		1: {
			O: {
				mdComment: "Onomatopoeia",
				rncLeft: "INTJ",
				udPOS: "INTJ"
			}
		},
		2: {
			g: {
				mdComment: "general"
			}
		}
	},
	D: {
		1: {
			D: {
				mdComment: "Residual",
				udPOS: "X"
			}
		},
		2: {
			f: {
				mdComment: "foreign"
			},
			t: {
				mdComment: "typo"
			},
			p: {
				mdComment: "segmentation"
			},
			h: {
				mdComment: "tag"
			},
			l: {
				mdComment: "link"
			},
			e: {
				mdComment: "e-mail addresses"
			}
		}
	},
	T: {
		1: {
			T: {
				mdComment: "Punctuation",
				udPOS: "PUNCT"
			}
		},
		2: {
			p: {
				mdComment: "full stop/period (.)"
			},
			c: {
				mdComment: "comma (,)"
			},
			s: {
				mdComment: "semicolon (;)"
			},
			n: {
				mdComment: "colon (:)"
			},
			q: {
				mdComment: "question mark (?)"
			},
			e: {
				mdComment: "exclamation mark (!)"
			},
			i: {
				mdComment: "ellipsis (...)"
			},
			h: {
				mdComment: "dash, minus (- – —)"
			},
			l: {
				mdComment: "opening bracket ([{"
			},
			r: {
				mdComment: "closing bracket )]}"
			},
			u: {
				mdComment: "quotation mark (\"'„“)"
			},
			t: {
				mdComment: "slash, stroke"
			},
			x: {
				mdComment: "other marks, symbols (\\*%^$)"
			}
		}
	}
};
