export function getBasePath() {
    if (window.location.href.includes('github.io')) {
        //const path = window.location.href.replace(/.+io(.+)\//, /$1/);
        const path = window.location.href.replace(/(.+)\//, '$1');
        console.log(path);
        return path;
    } else
        return '';
}