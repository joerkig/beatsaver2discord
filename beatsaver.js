const WebSocket = require("ws"),
  XMLHttpRequest = require("xhr2"),
  webhookURL = process.argv[3],
  webhookURLBot = process.argv[4] ? process.argv[4] : process.argv[3],
  emojis = process.argv[2],
  diffmojies = {
    Easy: "<:easy:952058301611409408>",
    Normal: "<:normal:952058301913366618>",
    Hard: "<:hard:952058302093737994>",
    Expert: "<:expert:952058301695295509>",
    ExpertPlus: "<:expertplus:952058301586210846>",
    Standard: "<:Standard:952058303398178886>",
    StandardEasy: "<:standardeasy:952058302425100288>",
    StandardNormal: "<:standardnormal:952058302496391189>",
    StandardHard: "<:standardhard:952058302429278238>",
    StandardExpert: "<:standardexpert:952058302408302612>",
    StandardExpertPlus: "<:standardexpertplus:952058302429282354>",
    OneSaber: "<:OneSaber:952058303507230770>",
    OneSaberEasy: "<:onesabereasy:952058302609641492>",
    OneSaberNormal: "<:onesabernormal:952058302320234496>",
    OneSaberHard: "<:onesaberhard:952058302399938581>",
    OneSaberExpert: "<:onesaberexpert:952058302525734942>",
    OneSaberExpertPlus: "<:onesaberexpertplus:952058302383128596>",
    NoArrows: "<:NoArrows:952058303100379196>",
    NoArrowEasy: "<:noarrowseasy:952058302303436811>",
    NoArrowsNormal: "<:noarrowsnormal:952058302550913044>",
    NoArrowsHard: "<:noarrowshard:952058302383157258>",
    NoArrowsExpert: "<:noarrowsexpert:952058302441873468>",
    NoArrowsExpertPlus: "<:noarrowsexpertplus:952058302311854110>",
    NinetyDegree: "<:90Degree:952058301569441822>",
    NinetyDegreeEasy: "<:90degreeeasy:952058301145841694>",
    NinetyDegreeNormal: "<:90degreenormal:952058301368107028>",
    NinetyDegreeHard: "<:90degreehard:952058301267476491>",
    NinetyDegreeExpert: "<:90degreeexpert:952058301162610718>",
    NinetyDegreeExpertPlus: "<:90degreeexpertplus:952058301137424405>",
    ThreeSixtyDegree: "<:360Degree:952058303213617172>",
    ThreeSixtyDegreeEasy: "<:360degreeeasy:952058301523300382>",
    ThreeSixtyDegreeNormal: "<:360degreenormal:952058301900804096>",
    ThreeSixtyDegreeHard: "<:360degreehard:952058301389082644>",
    ThreeSixtyDegreeExpert: "<:360degreeexpert:952058301569433610>",
    ThreeSixtyDegreeExpertPlus: "<:360degreeexpertplus:952058301305221180>",
    Lightshow: "<:Lightshow:952058303318462494>",
    LightshowEasy: "<:lightshoweasy:952058301909205014>",
    LightshowNormal: "<:lightshownormal:952058302030823426>",
    LightshowHard: "<:lightshowhard:952058302282498048>",
    LightshowExpert: "<:lightshowexpert:952058302223777852>",
    LightshowExpertPlus: "<:lightshowexpertplus:952058302659969094>",
    Lawless: "<:Lawless:952058303926665286>",
    LawlessEasy: "<:lawlesseasy:952058302206984212>",
    LawlessNormal: "<:lawlessnormal:952058301909184524>",
    LawlessHard: "<:lawlesshard:952058302152450128>",
    LawlessExpert: "<:lawlessexpert:952058302156664923>",
    LawlessExpertPlus: "<:lawlessexpertplus:952058302282489916>",
  };
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

      let difficulties = "";

      if (emojis === "text") {
        let diffs = {
          characteristics: [],
        };
        obj.msg.versions[obj.msg.versions.length - 1].diffs.forEach(
          (element) => {
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
          }
        );
        diffs.characteristics.forEach((element) => {
          difficulties += `${diffs[element].slice(0, -2)}\n`;
        });
      } else if (emojis === "emojis") {
        obj.msg.versions[obj.msg.versions.length - 1].diffs.forEach(
          (element) => {
            difficulties +=
              diffmojies[
                `${element.characteristic
                  .replace("90", "Ninety")
                  .replace("360", "ThreeSixty")}${element.difficulty}`
              ];
          }
        );
      }

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
