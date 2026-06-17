const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('pm2 logs creator-manager --lines 50 --raw', (err, stream) => {
    if (err) throw err;
    stream.on('data', (d) => process.stdout.write(d.toString()));
    stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
    stream.on('close', () => conn.end());
  });
});
conn.connect({ host: '129.226.215.178', port: 22, username: 'ubuntu', password: 'shadow-63@-nebula' });
