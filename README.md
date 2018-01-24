# Application Frame

[![Greenkeeper badge](https://badges.greenkeeper.io/TitanNanoDE/ApplicationFrame.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/TitanNanoDE/ApplicationFrame.svg?branch=master)](https://travis-ci.org/TitanNanoDE/ApplicationFrame)
[![npm version](https://badge.fury.io/js/application-frame.svg)](https://badge.fury.io/js/application-frame)
[![Coverage Status](https://coveralls.io/repos/github/TitanNanoDE/ApplicationFrame/badge.svg?branch=master)](https://coveralls.io/github/TitanNanoDE/ApplicationFrame?branch=master)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/57df220d093b4b0d8efd78fd55c48af5)](https://www.codacy.com/app/titannanomail/ApplicationFrame?utm_source=github.com&utm_medium=referral&utm_content=TitanNanoDE/ApplicationFrame&utm_campaign=badger)

Application Frame is an open and light weight Programming Framework for the Web. It's simple architecture lets the Framework seamlessly argument the core features of different ECMAScript runtimes. Application Frame an it's modules allows developers to develop at the heart of the Web while enjoying enhanced comfort.

## The Core
The core of Application Frame provides ECMAScript prototypes for Applications, DataStorages, EventTargets and NetworkRequests.
These prototypes provide basic functionality and abstraction of the underlying platform.

### Usage
All prototypes can be used via native ECMAScript prototype inheritance.
Since ECMAScript 2015, this can be easily done with object literals.

```JavaScript
const NewApplication = {
    __proto__: Application
};
```

If a prototype requires construction instructions, these can be run via the `constructor()` method. The constructor always returns it's current instance.

[More details about all core features](https://github.com/TitanNanoDE/ApplicationFrame/wiki/Core)

## Features
All of Application Frames features can be found in the Wiki. They cover NodeJS,
IndexedDBs, memory management, access to the browser rendering engine, an abstracted ServiceWorker interface,
access to the websites manifest and many other things.
