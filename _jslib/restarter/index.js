let {spawn} = require('child_process');
let child = spawnChild();

main();

function main() {
	process.on('SIGHUP', () => {
		child.on('close', () => child = spawnChild());
		child.kill('SIGTERM');
	});
}

function spawnChild() {
	return spawn(
		'node',
		['index.js', ...process.argv.slice(2)],
		{cwd: process.cwd(), detached: true, stdio: 'inherit'}
	);
}
