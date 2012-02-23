Tweereal
---------------

Real-time twitter map based on Twitter Streaming API. Builded on node.js, websockets and canvas.

### Dependencies ###

+ socket.io
+ oauth-client
+ express

### Backend ###

+ HAProxy as front-end server
+ nginx for serving static content
+ forever (nodejitsu) for making fault tolerant application
+ init.d scripts

### Executables ###
+ api-client/restreamer.js - client for twitter api
+ web-server/express.js - webserver