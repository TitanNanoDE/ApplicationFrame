'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.config = exports.main = undefined;

var _make = require('util/make.js');

var _error = require('util/error.js');

var _error2 = _interopRequireDefault(_error);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var select = function (selector) {
    if (selector[0] == '@') {
        return document.querySelectorAll(selector.substr(1));
    } else {
        return document.querySelector(selector);
    }
};

var main = exports.main = function (Prototypes, Scopes) {
    var { ApplicationScopeInterface } = Prototypes;
    var { error } = _error2.default;

    Prototypes.ControllerTreeNode = {
        _make: function (queryTree) {
            var node = null;
            var listeners = [];
            var construct = null;

            if ((0, _make.hasPrototype)(queryTree, String)) {
                node = select(queryTree);
            } else if ((0, _make.hasPrototype)(queryTree, Object)) {
                Object.keys(queryTree).forEach(key => {
                    if (key == 'selector') {
                        node = select(queryTree[key]);
                    } else if (key[0] == '$') {
                        listeners.push({ name: key.substr(1), f: queryTree[key] });
                    } else if (key == 'c') {
                        construct = queryTree[key];
                    } else {
                        this[key] = (0, _make.Make)(Prototypes.ControllerTreeNode)(queryTree[key]);
                    }
                });

                if (construct !== null) construct.apply(this);

                listeners.forEach(item => {
                    if ((0, _make.hasPrototype)(node, NodeList)) {
                        [].forEach.apply(node, [node => {
                            node.addEventListener(item.name, item.f);
                        }]);
                    } else {
                        node.addEventListener(item.name, item.f);
                    }
                });
            }

            Scopes.set(this, node);
        },

        attribute: function () {},

        dataset: function (name, value) {
            var node = Scopes.get(this);

            if (value) node.dataset[name] = value;else return node.dataset[name];
        }
    };

    Prototypes.ApplicationScopeInterface = (0, _make.Make)({

        controller: function (tree) {}

    }, ApplicationScopeInterface).get();
};

var config = exports.config = {
    main: 'main',
    version: 'v1.0',
    author: 'Jovan Gerodetti',
    type: 'extension'
};

/*
query tree

{
    'body' {
        name : 'body',
        header : '.header',
        content : {
            c : function(){},
            selector : 'div.content',
            $click : function(){},
            title : '.title span',
            main : '.main',
            articles : {
                selector : '@.main .article',
                $click : function(){},
            },
            'footer' : {
                selector : 'footer',
                left : '.left',
                right : {
                    $mouseover : function(){}
                }
            }
        }
    }
}

*/