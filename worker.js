const { Cache } = require("./Cache")
const { parentPort } = require("worker_threads");

const cache = new Cache()

parentPort.on("message", (message) => {
    switch (message.type) {
        case "set":
            cache.set(message.key, message.value)
            parentPort.postMessage({ code: true, type: "set", key: message.key, value: message.value })
            break;
        case "get":
            if (cache.has(message.key)) {
                parentPort.postMessage({ code: true, type: "get", key: message.key, value: cache.get(message.key) })
                break;
            }
            parentPort.postMessage({ code: false, type: "get", key: message.key, value: undefined })
            break;
        case "has":
            parentPort.postMessage({ code: true, type: "has", key: message.key, value: cache.has(message.key) })
            break;
        case "del":
            if (cache.has(message.key)) {
                cache.del(message.key)
                parentPort.postMessage({ code: true, type: "del", key: message.key })
                break;
            }
            parentPort.postMessage({ code: false, type: "del", key: message.key })
            break;
        case "siz":
            parentPort.postMessage({ code: true, type: "siz", value: cache.size() })
            break;
        default:
            parentPort.postMessage({ code: false, type: "error", message: "Unknown message type" })
            break;
    }
})