//Fix for GH-Pages relative paths

export function getBasePath() {
    if (window.location.href.includes('pikne-programy.github.io'))
        return window.location.href.replace(/(.+)\//, '$1');
    else
        return '';
}

export function importLocal() {
    if (window.location.href.includes('pikne-programy.github.io')) {
        const path = window.location.href.replace(/(.+)\//, '$1');
        $('head').append('<link rel="stylesheet" href="' + path + '/helper/custom-scrollbar/customscroll.css" />');
        $('head').append('<script src="' + path + '/helper/custom-scrollbar/customscroll.js"></script>');
    }
}