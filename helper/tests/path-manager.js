export function getBasePath() {
    if (window.location.href.includes('github.io'))
        return '/pikne-programy-frontend';
    else
        return '';
}