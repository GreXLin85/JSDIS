const net = require('net');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'command> ',
    terminal: true
});


const client = new net.Socket();
client.connect(1337, '127.0.0.1', async function () {
    console.log("Welcome To JSDIS");
});

client.on('data', function (data) {
    console.log(data.toString());
    rl.question('command> ', (command) => {
        if (command == "ext") {
            rl.close();
            client.end();
            return 0;
        }
        readline.clearLine(process.stdout, 0);
        client.write(command);
    });
});

client.on('close', function () {
    console.log('Connection closed');
});

process.on('SIGINT', function () {
    rl.close();
    client.end();
});