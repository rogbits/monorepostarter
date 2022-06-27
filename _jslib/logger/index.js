class Logger {
	testingMode = false;
	savedMessages = [];

	clear() {
		this.savedMessages = [];
	}

	log() {
		if (this.testingMode) {
			this.savedMessages.push(...Array.from(arguments));
			return;
		}

		console.log(...arguments);
	}
}

module.exports = Logger;
