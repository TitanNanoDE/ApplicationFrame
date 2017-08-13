(() => {

    const BodyNode = {
        parentElement: {
            dir: '',
            lang: '',
        },
    };

    const MetaDescription = {
        content: '',
    };

    const MetaThemeColor = {
        content: '',
    };

    global.document = {

        body: BodyNode,

        head: {
            dir: '',
            lang: '',
            title: '',
        },

        querySelector(selector) {
            if (selector === 'meta[description]') {
                return MetaDescription;
            } else if (selector = 'meta[theme-color]') {
                return MetaThemeColor;
            } else if (selector === 'link[rel="manifest"]') {
                return null;
            }
        }
    }

    global.getComputedStyle = function() {
        return global.computedStyle;
    };

    global.computedStyle = { backgroundColor: 'rgb(255, 255, 255)' };
})();
