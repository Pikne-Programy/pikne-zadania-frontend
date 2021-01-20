export function getBasePath() {
    //Fix for GH-Pages relative paths
    if (window.location.href.includes('pikne-programy.github.io')) {
        const path = window.location.href.replace(/(.+)\//, '$1');
        return path;
    } else
        return '';
}