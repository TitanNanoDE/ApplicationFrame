import { Make } from '../../util/make.js';
import NetworkRequest from '../../core/prototypes/NetworkRequest.js';
//import { polyInvoke } from './Util.js';


/*let FakeTemplate = {
    _markup : '',
    _fragment: null,

    _make : function(markup) {
        this._markup = markup;
    },

    get content() {
        if (!this._fragment) {
            this._fragment = new DocumentFragment();
            let container = document.createElement('div');

            polyInvoke(container).innerHTML = this._markup;

            [].forEach.apply(container.childNodes, [element => {
                polyInvoke(this._fragment).appendChild(element);
            }]);
        }
        return this._fragment;
    }
};*/

export let importTemplate = function(source, template) {
    let request = Make(NetworkRequest)(source, {});

    return request.send().then(markup => {
        template.innerHTML = markup;

        return template;
    });
}
