const { Client } = require('ssh2');

const IP = '129.226.215.178';
const USER = 'ubuntu';
const PASSWORD = 'shadow-63@-nebula';

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH connection established for git pull, npm build, and restart...');

  const commands = [
    'cd /home/ubuntu/creator-manager',
    'git pull',
    'npm install',
    'npm run build',
    'pm2 restart creator-manager',
    'pm2 list'
  ].join(' && ');

  conn.exec(commands, (err, stream) => {
    if (err) throw err;
    stream.on('data', (d) => process.stdout.write(d.toString()));
    stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
    stream.on('close', () => {
      conn.end();
    });
  });
});

conn.on('error', (err) => {
  console.error(err);
});

conn.connect({
  host: IP,
  port: 22,
  username: USER,
  password: PASSWORD
});
