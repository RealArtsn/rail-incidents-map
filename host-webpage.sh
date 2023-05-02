# Host http server with npm
if  [ ! -d "node_modules/http-server" ]; then
  npm install http-server;
fi

"node_modules/http-server/bin/http-server" $1

