const WebSocket = require("ws"),
  XMLHttpRequest = require("xhr2"),
  webhookURL = process.argv[2],
  webhookURLBot = process.argv[3] ? process.argv[3] : process.argv[2];
let ws = new WebSocket("wss://ws.beatsaver.com/maps");

function connect() {
  var ws = new WebSocket("wss://ws.beatsaver.com/maps");
  ws.onopen = function () {
    ws.send(JSON.stringify({ command: "subscribe" }));
  };

  ws.onmessage = function (msg) {
    const obj = JSON.parse(msg.data);

    if (obj.type === "MAP_UPDATE") {
      let request = new XMLHttpRequest();
      request.open("POST", obj.msg.automapper ? webhookURLBot : webhookURL);

      request.setRequestHeader("Content-type", "application/json");

      let params = {
        username: "Map Update",
        content: null,
        embeds: [
          {
            title:
              obj.msg.name.length > 250
                ? `${obj.msg.name.substring(0, 245)}...`
                : obj.msg.name,
            description:
              obj.msg.description.length > 4000
                ? `${obj.msg.description.substring(0, 3995)}...`
                : obj.msg.description,
            url: `https://beatsaver.com/maps/${obj.msg.id}`,
            color:
              obj.msg.versions[obj.msg.versions.length - 1].state ===
              "Published"
                ? 32768
                : 16753920,
            fields: [],
            author: {
              name: obj.msg.uploader.name,
              url: `https://beatsaver.com/profile/${obj.msg.uploader.id}`,
              icon_url: obj.msg.uploader.avatar,
            },
            footer: {
              text: `!bsr ${obj.msg.id} | BPM: ${obj.msg.metadata.bpm} | Duration: ${obj.msg.metadata.duration}`,
            },
            timestamp: obj.msg.updatedAt,
            thumbnail: {
              url: obj.msg.versions[obj.msg.versions.length - 1].coverURL,
            },
          },
        ],
      };

      let tags = "";
      tags += `${obj.msg.versions[obj.msg.versions.length - 1].state}, `;
      obj.msg.automapper ? (tags += "Auto Mapper, ") : null;
      obj.msg.ranked ? (tags += "Ranked, ") : null;
      obj.msg.qualified ? (tags += "Qualified, ") : null;
      obj.msg.tags.forEach((element) => {
        tags += `${element[0].toUpperCase()}${element.slice(1)}, `;
      });

      tags = tags.slice(0, -2);
      if (tags !== "") {
        params.embeds[0].fields[params.embeds[0].fields.length] = {
          name: "Tags",
          value: tags,
        };
      }

      let diffs = {
        characteristics: [],
      };
      obj.msg.versions[obj.msg.versions.length - 1].diffs.forEach((element) => {
        if (!diffs[element.characteristic]) {
          diffs[element.characteristic] = `${element.characteristic}: `;
        }
        if (!diffs.characteristics.includes(element.characteristic)) {
          diffs.characteristics.push(element.characteristic);
        }
        diffs[element.characteristic] += `${element.difficulty.replace(
          "Plus",
          "+"
        )}, `;
      });
      let difficulties = "";
      diffs.characteristics.forEach((element) => {
        difficulties += `${diffs[element].slice(0, -2)}\n`;
      });

      params.embeds[0].fields[params.embeds[0].fields.length] = {
        name: "Difficulties",
        value: difficulties,
      };

      (params.embeds[0].fields[params.embeds[0].fields.length] = {
        name: "Buttons",
        value: `__**[One-Click](https://joerkig.com/beatsaver/${
          obj.msg.id
        })**__ | __**[Preview](https://skystudioapps.com/bs-viewer/?id=${
          obj.msg.id
        })**__ | __**[Download](${
          obj.msg.versions[obj.msg.versions.length - 1].downloadURL
        })**__`,
        url: `https://beatsaver.com/maps/${obj.msg.id}`,
      }),
        request.send(JSON.stringify(params));
    } else if (obj.type === "MAP_DELETE") {
      let request = new XMLHttpRequest();
      request.open("POST", webhookURL);

      request.setRequestHeader("Content-type", "application/json");

      let params = {
        username: "Map Deletion",
        content: null,
        embeds: [
          {
            title: obj.msg,
            color: 16711680,
          },
        ],
      };

      request.send(JSON.stringify(params));
    }

    console.log(obj.type, obj.msg);
  };

  ws.onclose = function (e) {
    console.log(
      "Socket is closed. Reconnect will be attempted in 1 second.",
      e.reason
    );
    setTimeout(function () {
      connect();
    }, 1000);
  };

  ws.onerror = function (err) {
    console.error("Socket encountered error: ", err.message, "Closing socket");
    ws.close();
  };
}

connect();
