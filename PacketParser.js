module.exports = PacketParser = (packet) => {
    let packet_type = packet.substring(0, 3).trim();
    if (packet_type != "set" && packet_type != "get" && packet_type != "del" & packet_type != "siz" && packet_type != "clr") {
        return {
            type: "unknown",
            data: null
        }
    }

    let packet_data;
    switch (packet_type) {
        case "set":
            let splitted_packet_data = packet.substring(4).split(" ")
            let packet_data_key = splitted_packet_data[0];
            delete splitted_packet_data[0];
            let packet_data_value = splitted_packet_data.join(" ").trim();
            packet_data = {
                key: packet_data_key,
                value: packet_data_value
            }
            break;
        case "get":
        case "del":
            packet_data = {
                key: packet.split(" ")[1]
            }
            break;
        case "siz":
        case "clr":
            packet_data = { value: "ok" }
            break;
        default:
            packet_data = { key: "error" }
            break;
    }
    return {
        type: packet_type,
        data: packet_data
    };
}