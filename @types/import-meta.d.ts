interface ImportMeta {
	readonly version: string;
	readonly swCacheKey: string;
	readonly runnerUrl: string;
	readonly importsWorkerPath: string;
	readonly serviceWorkerPath: string;
	readonly pkg: {
		readonly name: string;
		readonly version: string;
		readonly gitCommitHash: string;
		readonly homepage: string;
		readonly repository:
			| string
			| {
					readonly url: string;
			  };
	};
}
