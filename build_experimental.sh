#!/bin/bash
# build script for Application Frame
## It is not required to run this build script if you just want to use 
## the ApplicationFrame in a non Mozilla Add-on SDK like environment, but for productive work
## it is recommended to run this script to compile the code to ECMAScript 5 and compress it.
## 
## Usage: 
##	ENGINE=path 		Your selected engine  
##	BUILD_DIR=path 		Use this to set your desired build directory
##	COMPILER_PREFIX=path	Use this if you want the compilers stored on a different location

if [ -e ".buildconfig" ]
then
	source .buildconfig
fi

echo "engine: $ENGINE"
echo "build dir: $BUILD_DIR"
echo "compiler prefix: $COMPILER_PREFIX";

# scream for build directory
if [ "$BUILD_DIR" = "" ]
then
	echo "missing build directory!\n";
	exit 0;
fi

rm -r $BUILD_DIR/*;

# set compiler prefix if no one is set
if [ "$COMPILER_PREFIX" = "" ]
then
	COMPILER_PREFIX=.
fi

# skip compiling if desired
if [ "$NO_COMPILE" = "1" ]
then
	echo "copying files..."
	rsync -r ./ $BUILD_DIR --exclude '*.md' --exclude '*.sh' --exclude '.git*' --exclude '.travis*' --exclude '*-compiler' --exclude 'build*'

# compile if not skipped
else
	perl ./build/compile.pl --prefix=$BUILD_DIR --compiler-prefix=$COMPILER_PREFIX
	echo "copying files..."
	cp ./LICENSE $BUILD_DIR/LICENSE
	cp ./mozilla/package.json $BUILD_DIR/mozilla/package.json
fi

# create add-on SDK file tree
if [ "$ENGINE" = "mozilla" ]
then
	echo "rearrange to add-on SDK file tree..."
	cp -r $BUILD_DIR/mozilla/* $BUILD_DIR/
	mv -f $BUILD_DIR/modules $BUILD_DIR/lib/modules
	mv -f $BUILD_DIR/af.js $BUILD_DIR/lib/core.js
	mv -f $BUILD_DIR/libs $BUILD_DIR/lib/libs
fi

echo "remove unnecessary files..."
rm -r $BUILD_DIR/mozilla



