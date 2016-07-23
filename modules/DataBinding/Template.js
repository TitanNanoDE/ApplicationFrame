import { Make } from '../../util/make.js';
import { bindNode } from './Bind.js';
import { importTemplate } from './TemplateLoader.js';
import { polyInvoke } from './Util.js';
import ScopePrototype from './ScopePrototype.js';

let makeElementFromTemplate = function(template, scope, application, item) {
    let node = document.importNode(template.content, true);
    let placeholder = node.querySelector('bind-placeholder');

    item.attributes.forEach(attr => {
        polyInvoke(node.firstElementChild).setAttribute(attr.name, attr.value);
    });

    if (placeholder) {
        let node = item.firstElementChild;
        polyInvoke(placeholder.parentNode).replaceChild(item.firstElementChild, placeholder);

        [].forEach.apply(item.children, [item => {
            polyInvoke(node.parentNode).appendChild(item);
        }]);
    }

    node.firstElementChild.className = template.id + ' ' + node.firstElementChild.className;

    scope = scope();

    [].map.apply(node.firstElementChild.attributes, [item => {
        if (item.name.search(/^scope\-/) > -1 ) {
            scope[item.name.replace(/^scope\-/, '')] = item.value;
        }
    }]);

    if (template.hasAttribute('component')) {
        scope.element = node.firstElementChild;
    }

    scope = bindNode(node, scope);

    polyInvoke(item.parentNode).replaceChild(node, item);

    if (application) {
        application.emit(`newElement:${template.id}`, scope);
    }
};

/**
 * creates a new instance of an HTML template and applies the binding with
 * the given scope.
 *
 * @param {Node|string} template - the template to render
 * @param {ScopePrototype} scope - the scope for this template to bind to
 * @param {ApplicationScopeInterface} application - the application this template belongs to
 * @return {Object} - collection of scope and rendered element
 */
export let makeTemplate = function (template, scope, application) {
    template = (typeof template === 'string') ? document.querySelector(template) : template;

    if (template.hasAttribute('src') && !template.processed) {
        let source = template.getAttribute('src');

        scope = Make(scope, ScopePrototype)();

        importTemplate(source, template)
            .then(template => {
                template.processed = true;
                makeTemplate(template, scope, application)
            });

        return scope;

    } else if (template.hasAttribute('bind-element')) {
        let makeElement = makeElementFromTemplate.bind(this, template, scope, application);
        let list = document.querySelectorAll(template.id);

        [].forEach.apply(list, [makeElement]);

        (new MutationObserver(mutations => {
            mutations.forEach(item => {
                if (item.addedNodes.length > 0) {
                    let list = document.querySelectorAll(template.id);

                    [].forEach.apply(list, [makeElement]);
                }
            });
        })).observe(document.body, {
            childList : true,
            subtree : true
        });

    } else {
        let node = document.importNode(template.content, true);
        let isReplace = template.hasAttribute('replace');
        let isInsert = template.hasAttribute('insert');

        scope = bindNode(node, scope);

        if (isReplace || isInsert) {
            let elementList = [].slice.apply(node.childNodes);

            scope.__cleanElements__ = function(){
                elementList.forEach(node => {
                    node.parentNode && node.parentNode.removeChild(node);
                });
            }
        }

        if (isReplace) {
            console.log('replace template');
            polyInvoke(template.parentNode).replaceChild(node, template.bare);
        } else if (isInsert) {
            polyInvoke(template.parentNode).insertBefore(node, template.bare);
        }

        return {　node : node, scope : scope };
    }
};
