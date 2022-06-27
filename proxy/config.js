module.exports = {
	allowList: new Set(),
	serverPort: 8080,
	reload() {
		let allowListFromEnv = process.env.ALLOW_LIST;
		let split = allowListFromEnv?.split(',') || [];
		split = Array.isArray(split)
			? split.map(s => s.trim()).filter(String)
			: split;
		this.allowList = new Set(split);
	}
};
