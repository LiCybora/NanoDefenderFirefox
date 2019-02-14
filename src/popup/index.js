/******************************************************************************

    Nano Defender - An anti-adblock defuser
    Copyright (C) 2016-2018  Nano Defender contributors

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

*******************************************************************************

    Popup panel script.

******************************************************************************/

"use strict";

/*****************************************************************************/

/**
 * Homepage links.
 * @const {Map}
 */
const home = [
    "",
    "https://jspenguin2017.github.io/uBlockProtector/",
    "https://github.com/jspenguin2017/uBlockProtector",
    chrome.runtime.getURL("/reporter/index.html"),
];

/*****************************************************************************/

{
    const manifest = chrome.runtime.getManifest();
    cssSelect(".title > p").text(manifest.name + " " + manifest.version);
    // Check whether console is allowed
    const request = browser.runtime.sendMessage({
        cmd: "get status",
    });
    request.then((msg)=> {
        cssSelect("#toggleConsole").prop("checked", msg.status); 
    }, (e) => console.log(e));
}

/*****************************************************************************/

chrome.tabs.query({
    active: true,
    currentWindow: true,
}, (tabs) => {
    if (chrome.runtime.lastError || tabs.length === 0)
        return;

    home[3] = home[3] + "?" + tabs[0].id;
});

/*****************************************************************************/

cssSelect(".wrapper").on("click", function () {
    if (this.dataset.home !== '0') {
        const url = home[this.dataset.home] + this.dataset.href;
        chrome.tabs.create({ url: url });
    }
});

cssSelect("#toggleConsole").on("click", function() {
    browser.runtime.sendMessage({
        "cmd": "toggle console",
        "status": cssSelect("#toggleConsole").prop("checked"),
    });
})

/*****************************************************************************/

