export interface Tagger {
	tagRNCSentences(ses: Element[], xml: Document): Promise<void>;
}
