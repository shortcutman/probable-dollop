"use strict";

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const { exec } = require('child_process');

const expresssse = require('express-sse');

app.get('/', (req, res) => {
	res.sendFile( __dirname + '/index.html');
});

var vlc = null;
var vlcStatus = new expresssse();
app.post('/ts/vlc', (req, res) => {
	if (vlc)
	{
		console.log('already exists');
		res.end();
	}

	vlc = exec('raspivid -o - -t 0 -hf -g 12 -w 800 -h 400 -fps 24 | cvlc -vvv stream:///dev/stdin --sout \'#standard{access=udp,mux=ts,dst=192.168.1.9:8160}\' :demux=h264');
	
	vlc.stdout.on('data', (data) => {
		// console.log(`stdout: ${data}`);
		vlcStatus.send(`VLC standard out: ${data}`);
	});

	vlc.stderr.on('data', (data) => {
	  	// console.log(`stderr: ${data}`);
	  	vlcStatus.send(`VLC standard error: ${data}`);
	});

	vlc.on('close', (code) => {
	  	vlcStatus.send(`VLC close: ${code}`);
	  	// console.log(`child process exited with code ${code}`);
	});

	vlc.on('exit', (code) => {
		// console.log(`boom: ${code}`);
		vlcStatus.send(`VLC exit: ${code}`);
	});

	res.end();
});

app.delete('/ts/vlc', (req, res) => {
	vlc.kill();
	res.end();
})

app.get('/ts/vlc/status', vlcStatus.init);

app.listen(port, () => console.log('Listening on port ' + port));
