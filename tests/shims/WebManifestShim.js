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
            if (selector === 'meta[name="description"]') {
                return MetaDescription;
            } else if (selector === 'meta[name="theme-color"]') {
                return MetaThemeColor;
            } else if (selector === 'link[rel="manifest"]') {
                return null;
            }
        }
    };

    global.getComputedStyle = function() {
        return global.computedStyle;
    };

    global.computedStyle = { backgroundColor: 'rgb(255, 255, 255)' };
})();
