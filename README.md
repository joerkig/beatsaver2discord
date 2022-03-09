# beatsaver2discord
Receive beatsaver websocket send to discord webhook(s)

`node ./beatsaver.js <Discord Webhook URL> [Discord Webhook URL]`

Takes two parameters, the first one is the discord webhook url for human made beatsaver map updates and all deletions.
The second parameter is optionally a second discord webhook url for AI assisted map updates, if you do not include this parameter is will automatically set this to the same webhook as the normal maps
