chrome.browserAction.onClicked.addListener(buttonClicked);
function buttonClicked(tab) {
    let msg = { txt: 'Hello' };
    chrome.tabs.sendMessage(tab.id, msg);
}
