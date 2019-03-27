#!/bin/sh

pgrep -u $USER node
retval=$?

timestamp() {
  date +"%s"
}

if [ "$retval" = 0 ];
then
	echo "Bot already running !"
	exit 0;
fi

#setting up working folder as base.
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
./clearlogs.sh

cd "$DIR/.."
node bot.js |& tee "log/$(timestamp).log" &

