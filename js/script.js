const redirects = [['wikipedia', 'https://wikipedia.org/wiki/%s'], ['google', 'https://www.google.com/search?q=%s'], ['duckduckgo', 'https://duckduckgo.com/?q=%s'], ['stackexchange', 'http://stackexchange.com/search?q=%s'], ['se', 'http://stackexchange.com/search?q=%s']];
const defaultSearchEngine = 'https://www.google.com/search?q=%s';

setBackgroundFromBing();
setPlaceHolder(defaultSearchEngine);

document.body.addEventListener('keydown', function(e) {
    if (e.keyCode == 13) {
        e.preventDefault();
        const searchText = document.querySelector('input[type="text"]').value;
        for (var i = 0; i < redirects.length; i++) {
            if (searchText.toLowerCase().match('^' + redirects[i][0]) || searchText.toLowerCase().match(redirects[i][0] + '$')) {
                const newUrl = redirects[i][1].replace('%s', searchText.toLowerCase().replace(redirects[i][0], '').trim());
                openLink(newUrl);
                return;
            }
        }
        const newUrl = defaultSearchEngine.replace('%s', searchText.toLowerCase().trim());
        openLink(newUrl);
        return;
    }
}, false);

function openLink(href) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const tab = tabs[0];
        chrome.tabs.update(tab.id, {url: href});
    });
}

function setBackgroundFromBing() {
    request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            if (request.status === 200) {
                const responseObject = JSON.parse(request.responseText);
                document.querySelector('body').style.backgroundImage = 'url(https://www.bing.com' + responseObject['images'][0]['url'] + ')';
                const length = 30;
                const trimmedString = responseObject['images'][0]['copyright'].length > length ? responseObject['images'][0]['copyright'].substring(0, length - 3) + "..." : responseObject['images'][0]['copyright'];
                document.querySelector('span#cr').innerHTML = '© ' + trimmedString;
            } else {
                console.error('ERROR LOADING THE WALLPAPER, HTTP CODE: ' + request.status);
            }
        }
    }
    request.open('get', 'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US');
    request.setRequestHeader('Access-Control-Allow-Headers', '*');
    request.send(null);
}

function setPlaceHolder(url) {
    const location = getLocation(url);
    document.querySelector('input[type="text"]').setAttribute('placeholder', 'search on ' + location.hostname.replace('www.', ''));
}

function getLocation(href) {
    const match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
    return match && {
            href: href,
            protocol: match[1],
            host: match[2],
            hostname: match[3],
            port: match[4],
            pathname: match[5],
            search: match[6],
            hash: match[7]
        }
}