const { Worker } = require("worker_threads");
const net = require("net");
const events = require("events");
const PacketParser = require("./PacketParser");

let statistics = {
  total_data: 0,
  hit: 0,
  fail: 0,
};
let workers = [];
let users = [];
var callbackFromWorker = new events.EventEmitter();

function createNewWorker() {
  let worker = new Worker("./Worker.js")
    .on("message", (data) => {
      let tempDataWho = data.who;
      delete data.who;
      callbackFromWorker.emit("callback", data, tempDataWho);
      switch (data.type) {
        case "get":
          if (data.code) {
            statistics.hit++;
          } else {
            statistics.fail++;
          }
          break;
        case "set":
          statistics.total_data++;
          break;
        case "del":
          if (data.code) {
            total_data--;
            break;
          }
          break;
      }

      console.log(`Worker ${worker.threadId} has new data \r\n`, data);
    })
    .on("error", (err) => {
      console.log(`Worker ${worker.threadId} has error \r\n`, err);
    })
    .on("exit", (code) => {
      console.log(`Worker ${worker.threadId} exited with code ${code}`);
    });

  workers.push(worker);
}

callbackFromWorker.on("callback", (data, user) => {
  let usersCache = users;
  let userIndex = usersCache.findIndex((u) => u.id === user.id);
  let userSocket = usersCache[userIndex].socket;
  userSocket.write(JSON.stringify(data));
  userSocket.pipe(userSocket);
});

const server = net.createServer((c) => {
  let user = Buffer.from(c.remoteAddress, "utf8");

  if (users.indexOf(user) == -1) {
    users.push({
      user: user,
      socket: c,
    });
  }

  c.write(new Date() + " - Welcome");
  c.pipe(c);

  c.on("end", () => {
    console.log("client disconnected");
  });
  c.on("data", (data) => {
    let packet = PacketParser(data.toString());

    if (packet.type == "unknown") {
      callbackFromWorker.emit(
        "callback",
        {
          type: "unknown",
          code: false,
          data: null,
        },
        user
      );
    } else if (packet.type === "sts") {
      callbackFromWorker.emit(
        "callback",
        {
          type: "sts",
          code: true,
          data: statistics,
        },
        user
      );
    } else {
      if (workers.length == 0) {
        createNewWorker(packet.type, packet.data.key, packet.data.value);
      }
      workers[0].postMessage({
        type: packet.type,
        key: packet.data.key,
        value: packet.data.value,
        who: user,
      });
    }
  });
});

server.on("close", () => {
  workers.forEach((worker) => {
    worker.terminate();
  });
  users.forEach((user) => {
    user.socket.end();
  });
  callbackFromWorker.removeAllListeners();

  console.log("server closed");
});

server.listen(1337, "127.0.0.1");
