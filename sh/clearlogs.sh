#!/bin/sh

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR/../log"

pwd
ls -tp | grep -v '/$' | tail -n +11 | xargs -d '\n' -r rm --
