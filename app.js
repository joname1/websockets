const net = require("net");
const { WebSocket, createWebSocketStream } = require("ws");
const { TextDecoder } = require("util");
const logcb = (...args) => console.log.bind(this, ...args);

const port = process.env.PORT || 3000

const uuid = (process.env.UUID || '85c487e7-5180-41a8-b2f4-8d74dfba3889').replace(/-/g, "");

console.log("connection: ", 'vless://8328a0bd-2190-4c44-afc4-09799f26a977@REPLACE_ME:443?encryption=none&security=tls&sni=REPLACE_ME&type=ws&host=REPLACE_ME&path=/#zeabur6');

const wss = new WebSocket.Server({port},logcb("listen:", port));
wss.on("connection", (ws) => {
  //console.log("connection: ", new Date());
  ws.once("message", (msg) => {
    const [VERSION] = msg;
    const id = msg.slice(1, 17);
    if (!id.every((v, i) => v == parseInt(uuid.substr(i * 2, 2), 16))) return;
    let i = msg.slice(17, 18).readUInt8() + 19;
    const port = msg.slice(i, (i += 2)).readUInt16BE(0);
    const ATYP = msg.slice(i, (i += 1)).readUInt8();
    const host =
      ATYP == 1
        ? msg.slice(i, (i += 4)).join(".") //IPV4
        : ATYP == 2
        ? new TextDecoder().decode(
            msg.slice(i + 1, (i += 1 + msg.slice(i, i + 1).readUInt8()))
          ) //domain
        : ATYP == 3
        ? msg
            .slice(i, (i += 16))
            .reduce(
              (s, b, i, a) => (i % 2 ? s.concat(a.slice(i - 1, i + 1)) : s),
              []
            )
            .map((b) => b.readUInt16BE(0).toString(16))
            .join(":")
        : ""; //ipv6

    //console.log("msg:", host, port);
    ws.send(new Uint8Array([VERSION, 0]));
    const duplex = createWebSocketStream(ws);
    net
      .connect({ host, port }, function () {
        this.write(msg.slice(i));
        duplex
          .on("error", () => { console.log('E1') })
          .pipe(this)
          .on("error", () => { console.log('E2') })
          .pipe(duplex);
      })
      .on("error", logcb("Conn-Err:", { host, port }));
  }).on("error", logcb("EE:"));
});
