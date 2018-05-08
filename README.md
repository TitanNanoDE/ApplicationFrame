# Application Frame

[![Greenkeeper badge](https://badges.greenkeeper.io/TitanNanoDE/ApplicationFrame.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/TitanNanoDE/ApplicationFrame.svg?branch=master)](https://travis-ci.org/TitanNanoDE/ApplicationFrame)
[![npm version](https://badge.fury.io/js/application-frame.svg)](https://badge.fury.io/js/application-frame)
[![Coverage Status](https://coveralls.io/repos/github/TitanNanoDE/ApplicationFrame/badge.svg?branch=master)](https://coveralls.io/github/TitanNanoDE/ApplicationFrame?branch=master)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/57df220d093b4b0d8efd78fd55c48af5)](https://www.codacy.com/app/titannanomail/ApplicationFrame?utm_source=github.com&utm_medium=referral&utm_content=TitanNanoDE/ApplicationFrame&utm_campaign=badger)

Application Frame is an open and lightweight Programming Library for the Web. Its simple architecture lets the Library  seamlessly argument the core features of different ECMAScript runtimes. Application Frame and its modules allows developers to develop at the heart of the Web while enjoying enhanced comfort.
The Library provides a wide range of features which all try to argument the existing Web APIs.

## 🎊 MozSprint 🎉
Application Frame is taking part in the MozSprint 2018! Therefore, we would like to remind all new contributors to follow the [Mozilla Community Participation Guidelines](https://www.mozilla.org/en-US/about/governance/policies/participation/). 

### How can I participate? 
All tickets which are available for the Sprint are labeled with the `mozsprint` label. The projects current goal is to get the v1 ready for release. Therefore we need to make sure all APIs have a good test coverage and are at least rudamentaly documented. 
All communication should take place inside the Projects issue tracker, so feel free to comment on the open issues. If you'd like to work on an open ticket, mention so and you will be assigend to the issue.

If you find something you think you could contribute to the project please feel free to open a new issue, but please keep in mind that it is not guaranteed that new issues will be approved for the sprint, since new ideas always require consideration which we might not have time for.

## The Core
The core of Application Frame provides ECMAScript prototypes for Applications, DataStorages, EventTargets, NetworkRequests and other things.
These prototypes provide basic functionality and abstraction of the underlying platform.

### Usage
All prototypes can be used via native ECMAScript prototype inheritance.
Since ECMAScript 2015, this can be easily done with object literals.

```JavaScript
const NewApplication = {
    __proto__: Application
};
```

If a prototype requires construction instructions, these can be run via the `constructor()` method. The constructor always returns its current instance.

[More details about all core features](https://github.com/TitanNanoDE/ApplicationFrame/wiki/Core)

## Features
All of Application Frames features can be found in the Wiki. They cover NodeJS,
IndexedDBs, memory management, access to the browser rendering engine, an abstracted ServiceWorker interface,
access to the websites manifest and many other things.
