export function getBasePath() {
    if (window.location.href.includes('github.io')) {
        //const path = window.location.href.replace(/https:\/\/(.+)\//, '$1');
        const path = window.location.href.replace(/(.+)\//, '$1');
        console.log(window.location.href);
        console.log(path);
        return path;
    } else
        return '';
}