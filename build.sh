#!/bin/bash
# build script for Application Frame
## It is not required to run this build script if you just want to use 
## the Application Frame in a non Mozilla Add-on SDK like environment.
## Usage: 
##	ENGINE="your selected engine (no quotes)" 
##	CLEAN="1 for clean up (no quotes)" 
##	BUILD_DIR="use this if you want to set a different build directory (also no quotes)"
## Examples:
##	ENGINE=web CLEAN=1 BUILD_DIR=./build ./build.sh
##	ENGINE=mozilla BUILD_DIR=/home/user/add-ons/Application-Frame ./build.sh

echo "engine: $ENGINE"

if [ "$BUILD_DIR" != "" ]
then
	rm -rf $BUILD_DIR
	mkdir -p $BUILD_DIR
	rsync -r ./ $BUILD_DIR --exclude '*.md' --exclude '*.sh' --exclude '.git*'
	cd $BUILD_DIR
fi

echo "remove GitHub files..."
rm -rf ./.* 2>/dev/null

if [ "$ENGINE" = "mozilla" ]
then
	echo "rearrange to add-on SDK file tree..."
	cp -r ./mozilla/* ./
	mv ./modules ./lib/modules
	mv af.js ./lib/core.js
	mv ./libs ./lib/libs
fi

echo "remove unnecessary files..."
rm -r ./mozilla

if [ "$CLEAN" = "1" ]
then
	echo "clean up..."
	find ./ -name README.md -delete
fi
