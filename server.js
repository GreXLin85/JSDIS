const { Worker } = require('worker_threads');
const net = require('net');
const events = require('events');
const PacketParser = require('./PacketParser');

let statistics = {
    total_data: 0,
    hit: 0,
    fail: 0,
}
let workers = []
var callbackFromWorker = new events.EventEmitter();

function createNewWorker() {
    let worker = new Worker('./worker.js').on('message', (data) => {
        callbackFromWorker.emit('callback', data);
        switch (data.type) {
            case 'get':
                if (data.code) {
                    statistics.hit++;
                } else {
                    statistics.fail++;
                }
                break;
            case 'set':
                statistics.total_data++
                break;
            case 'del':
                if (data.code) {
                    total_data--;
                    break;
                }
                break;
        }

        console.log(`Worker ${worker.threadId} has new data \r\n`, data);
    }).on('error', (err) => {
        console.log(`Worker ${worker.threadId} has error \r\n`, err);
    }).on('exit', (code) => {
        console.log(`Worker ${worker.threadId} exited with code ${code}`);
    });

    workers.push(worker);
}

const server = net.createServer((c) => {
    console.log('client connected');
    c.write(new Date()+" - Welcome");
        c.pipe(c);
    callbackFromWorker.on("callback", (data) => {
        c.write(JSON.stringify(data));
        c.pipe(c);
    });

    c.on('end', () => {
        console.log('client disconnected');
    });
    c.on("data", (data) => {
        let packet = PacketParser(data.toString())

        if (packet.type == "unknown") {
            callbackFromWorker.emit('callback', {
                type: "unknown",
                code: false,
                data: null
            });
        } else {
            if (workers.length == 0) {
                createNewWorker(packet.type, packet.data.key, packet.data.value)
            }
            workers[0].postMessage({
                type: packet.type,
                key: packet.data.key,
                value: packet.data.value
            });

        }
    })

})

server.on("close", () => {
    workers.forEach((worker) => {
        worker.terminate();
    });
    callbackFromWorker.removeAllListeners();
    console.log("server closed");
})

server.listen(1337, '127.0.0.1');
