"use strict";

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const { exec } = require('child_process');

app.get('/', (req, res) => {
	res.sendFile( __dirname + '/index.html');
});

var vlc = null;
app.post('/ts/vlc', (req, res) => {
	if (vlc)
	{
		console.log('already exists');
		res.end();
	}

	console.log('yo');

	try {
		vlc = exec('raspivid -o - -t 0 -hf -g 12 -w 800 -h 400 -fps 24 | cvlc -vvv stream:///dev/stdin --sout \'#standard{access=udp,mux=ts,dst=192.168.1.9:8160}\' :demux=h264');
		// vlc = exec('raspivid -o - -t 0 -hf -g 12 -w 800 -h 400 -fps 24 | cvlc');

		vlc.stdout.on('data', (data) => {
		  console.log(`stdout: ${data}`);
		});

		vlc.stderr.on('data', (data) => {
		  console.log(`stderr: ${data}`);
		});

		vlc.on('close', (code) => {
		  console.log(`child process exited with code ${code}`);
		});

		vlc.on('exit', (code) => {
			console.log(`boom: ${code}`);
		});
	}
	catch (error)
	{
		console.log(`error: ${error}`);
	}
	finally
	{
		res.end();		
	}
});

app.delete('/ts/vlc', (req, res) => {
	vlc.kill();
	res.end();
})

//console.log(app._router.stack);
app.listen(port, () => console.log('Listening on port ' + port));
