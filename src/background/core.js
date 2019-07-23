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

    Core library for background rules.

******************************************************************************/

"use strict";

/*****************************************************************************/

/**
 * Run initialization steps. Call once on start up.
 * @function
 */
a.init = () => {

    // Default console is ON.
    a.register(a.allowConsole);

    /*************************************************************************/

    chrome.runtime.onMessage.addListener((msg, sender, res) => {
        if (
            msg === null || typeof msg !== "object" ||
            sender === null || typeof sender !== "object" ||
            typeof res !== "function"
        ) {
            return;
        }


        if (typeof msg.cmd === "string") {
            // commands for handling content script
            switch (msg.cmd) {
                case "toggle console":
                    a.allowConsole = msg.status;
                    a.register();
                    return;     
                case "toggle debug":
                    a.debugRule = msg.status;
                    a.register();
                    return;
                case "get status":
                    res({
                        "status": a.allowConsole,
                        "debug": a.debugRule
                    });
                    return;
                default:

            }
        }

        if (typeof msg.cmd !== "string" || typeof sender.tab !== "object")
            return;

        const tab = sender.tab.id;
        const frame = sender.frameId || 0;

        if (typeof tab !== "number" || typeof frame !== "number")
            return;

        switch (msg.cmd) {
            /**
             * Inject UserCSS to the caller tab.
             * @param {string} data - The CSS code to inject.
             */
            case "inject css":
                if (typeof msg.data === "string")
                    a.userCSS(tab, frame, msg.data);
                break;

            /**
             * Send a highly privileged XMLHttpRequest, it goes though
             * Cross Origin Resource Sharing policies as well as adblocker
             * filtering.
             * @param {Object} details - The details object, see a.xhr().
             * @return {string|null} The response text, or null if the request
             * failed.
             */
            case "xhr":
                if (typeof msg.details === "object") {
                    const onerror = () => {
                        res(null);
                    };

                    if (a.xhr(msg.details, res, onerror)) {
                        // Must return true since I need to respond to content
                        // script asynchronously
                        return true;
                    } else {
                        onerror();
                    }
                }
                break;

            /**
             * Forcefully close the sender tab.
             */
            case "remove tab":
                if (tab !== chrome.tabs.TAB_ID_NONE)
                    chrome.tabs.remove(tab, a.noopErr);
                break;

            //@pragma-if-debug
            /**
             * Log data to console. Only available in debug mode.
             * @param {string} data - The data to log.
             */
            case "log":
                if (a.debugMode)
                    console.log(msg.data);
                break;
            //@pragma-end-if

            default:
                break;
        }
    });

    /*************************************************************************/

    // Taken from https://bit.ly/2OJzDAI (GitHub gorhill/uBlock)
    const root = chrome.runtime.getURL("/");
    chrome.webRequest.onBeforeRequest.addListener(
        (details) => {
            if (!details.url.endsWith(a.rSecret))
                return { redirectUrl: root };
        },
        {
            urls: [
                a.rRoot + "*",
            ],
        },
        [
            "blocking",
        ],
    );

    /*************************************************************************/

    const reporter = chrome.runtime.getURL("/reporter/index.html");
    chrome.runtime.onMessageExternal.addListener((msg, sender, res) => {
        if (
            msg === null || typeof msg !== "object" ||
            typeof msg.data !== "string" ||
            sender.id !== a.NanoAdblockerExtensionID
        ) {
            return;
        }

        switch (msg.data) {
            case "Ping":
                res({ data: "ok" });
                break;

            case "Open Quick Issue Reporter":
                if (typeof msg.tab === "number") {
                    chrome.tabs.create({
                        url: reporter + "?" + msg.tab.toString(),
                    });
                    res({ data: "ok" });
                }
                break;

            default:
                break;
        }
    });

    setTimeout(() => {
        chrome.runtime.sendMessage(
            a.NanoAdblockerExtensionID,
            {
                data: "Nano Defender Enabled",
            },
            a.noopErr,
        );
    }, 15000);

    /*************************************************************************/

    //@pragma-if-debug

    if (a.debugMode) {
        chrome.browserAction.setBadgeText({ text: "DBG" });
        chrome.browserAction.setBadgeBackgroundColor({ color: "#406BD1" });
    } else {
        chrome.browserAction.setBadgeText({ text: "DEV" });
        chrome.browserAction.setBadgeBackgroundColor({ color: "#00871D" });
    }

    //@pragma-end-if

    /*************************************************************************/

    const hasNews = false;
    const newsPage =
        "https://jspenguin2017.github.io/uBlockProtector/#announcements";

    const newsReadFlag = "news-read";

    // This handler will become inactive when there is a popup page set
    chrome.browserAction.onClicked.addListener(() => {
        chrome.browserAction.setBadgeText({ text: "" });

        // Important: This must match the manifest
        chrome.browserAction.setPopup({ popup: "popup/index.html" });

        localStorage.setItem(newsReadFlag, "true");

        chrome.tabs.create({ url: newsPage });
    });

    if (hasNews) {
        if (
            !chrome.extension.inIncognitoContext &&
            !localStorage.getItem(newsReadFlag)
        ) {
            chrome.browserAction.setBadgeText({ text: "NEW" });
            chrome.browserAction.setBadgeBackgroundColor({ color: "#FF0000" });

            chrome.browserAction.setPopup({ popup: "" });
        }
    } else {
        localStorage.removeItem(newsReadFlag);
    }

    /*************************************************************************/

};

/*****************************************************************************/

/**
 * Whether console message is activated (default: true)
 * @var {boolean}
 */
a.allowConsole = true;

/**
 * Whether Debug rule is activated (default: false)
 * @var {boolean}
 */
a.debugRule = false;

/**
 * Record the registered content script (default: true)
 * @var {Object}
 */
a.registered = null;

/**
 * Register content script
 * @function
 */
 a.register = async () => {
    let scripts = [
        {"file": `content/${a.allowConsole ? "" : "un"}console.js`},
        {"file": "content/rules-common.js"},
        {"file": "content/rules-specific.js"},
        {"file": "content/rules-sticky.js"}
    ];
    if (a.debugRule) {
        scripts.push({"file": "content/debug.js"});
    }
    scripts.push({
        "code": 
            `"use strict";
            {
                a.inject(() => {
                    "use strict";
                    delete window.nanoConsole;
                });
            }`
    });
    if (a.registered) a.registered.unregister();
    a.registered = await browser.contentScripts.register({
        "allFrames": true,
        "js": scripts,
        "matchAboutBlank": true,
        "matches": [
            "http://*/*",
            "https://*/*"
        ],
        "runAt": "document_start"
    });
};

/*****************************************************************************/

/**
 * Check chrome.runtime.lastError and do nothing.
 * @function
 */
a.noopErr = () => {
    void chrome.runtime.lastError;
};

/*****************************************************************************/

/**
 * Resource access secret.
 * @const {string}
 */
a.rSecret =
    Math.random().toString(36).substring(2) +
    Math.random().toString(36).substring(2);

/**
 * Resource root directory.
 * @const {string}
 */
a.rRoot = chrome.runtime.getURL("/resources/");

/**
 * Create resource access URL.
 * @function
 * @param {string} name - The file name of the resource.
 */
a.rLink = (name) => {
    return a.rRoot + name + "?s=" + a.rSecret;
};

/*****************************************************************************/

/**
 * 1 second blank MP4, taken from
 * https://bit.ly/2JcYAyq (GitHub uBlockOrigin/uAssets).
 * @const {string}
 */
a.blankMP4 = a.rLink("blank.mp4");

/*****************************************************************************/

/**
 * Get the URL of a frame of a tab.
 * @function
 * @param {integer} tab - The ID of the tab.
 * @param {integer} frame - The ID of the frame.
 * @return {string} The URL of the tab, or an empty string if it is not known.
 */
a.getTabURL = (() => {
    let tabs = {};

    //@pragma-if-debug
    if (a.debugMode) {
        window.getTabURLInternal = tabs;
    }
    //@pragma-end-if

    chrome.tabs.query({discarded: false}, (existingTabs) => {
        for (let i = 0; i < existingTabs.length; i++) {
            const id = existingTabs[i].id;
            if (id !== chrome.tabs.TAB_ID_NONE) {
                if (!tabs[id]) {
                    tabs[id] = {};
                }
                tabs[id][0] = tabs[id][0] || existingTabs[i].url;

                chrome.webNavigation.getAllFrames({ tabId: id }, (frames) => {
                    if (!chrome.runtime.lastError && tabs[id]) {
                        for (let ii = 0; ii < frames.length; ii++) {
                            tabs[id][frames[ii].frameId] =
                                tabs[id][frames[ii].frameId] || frames[ii].url;
                        }
                    }
                });
            }
        }
    });

    chrome.webNavigation.onCommitted.addListener((details) => {
        if (!tabs[details.tabId] || details.frameId === 0) {
            tabs[details.tabId] = {};
        }
        tabs[details.tabId][details.frameId] = details.url;
    });
    chrome.tabs.onRemoved.addListener((id) => {
        delete tabs[id];
    });

    return (tab, frame) => {
        if (tabs[tab]) {
            return tabs[tab][frame] || "";
        } else {
            return "";
        }
    };
})();

/**
 * Check if the domain of an URL ends with one of the domains in the list.
 * A list entry "example.com" will match domains that matches
 * /(^|.*\.)example\.com$/.
 * @function
 * @param {string} url - The URL to check.
 * @param {Array.<string>} domList - The list of domains to compare.
 * @param {boolean} isMatch - Whether the domains list is a match list.
 * @return {boolean} True if the domain of the URL is in the list, false
 * otherwise.
 */
a.domCmp = (() => {
    const domainExtractor = /^https?:\/\/([^/]+)/;
    return (url, domList, isMatch) => {
        let dom = domainExtractor.exec(url);
        if (!dom) {
            return false;
        }
        dom = dom[1];

        for (let i = 0; i < domList.length; i++) {
            if (
                dom.endsWith(domList[i]) &&
                (
                    dom.length === domList[i].length ||
                    dom.charAt(dom.length - domList[i].length - 1) === "."
                )
            ) {
                return true === isMatch;
            }
        }
        return false === isMatch;
    };
})();

/*****************************************************************************/

/**
 * Register a static loopback server.
 * @function
 * @param {Array.<string>} urls - The urls to loopback.
 * @param {Array.<string>} types - The types of request to loopback.
 * @param {string} data - The data to loopback to, must be already encoded and
 * ready to serve.
 * @param {Array.<string>} [domList=undefined] - The domains list, omit to
 * match all domains.
 * @param {boolean} [isMatch=true] - Whether the domains list is a match list.
 */
a.staticServer = (urls, types, data, domList, isMatch = true) => {
    chrome.webRequest.onBeforeRequest.addListener(
        (details) => {
            const url = a.getTabURL(details.tabId, details.frameId);
            if (!domList || a.domCmp(url, domList, isMatch)) {

                //@pragma-if-debug
                if (a.debugMode) {
                    console.log("Redirected " + details.url + " to " + data);
                }
                //@pragma-end-if

                return { redirectUrl: data };
            }
        },
        {
            urls: urls,
            types: types,
        },
        [
            "blocking",
        ],
    );
};

/**
 * Register a dynamic loopback server.
 * @function
 * @param {Array.<string>} urls - The urls to loopback.
 * @param {Array.<string>} types - The types of request to loopback.
 * @param {Function} server - The server, this function will be passed as the
 * event listener, view Chromium API documentations for more information:
 * https://developer.chrome.com/extensions/webRequest
 * @param {Array.<string>} [domList=undefined] - The domains list, omit to
 * match all domains.
 * @param {boolean} [isMatch=true] - Whether the domains list is a match list.
 * @param {String} [onWhat="onBeforeRequest"] - function name of webRequest
 */
a.dynamicServer = (urls, types, server, domList, isMatch = true, onWhat="onBeforeRequest") => {
    let blockRes = ["blocking"];
    if (onWhat === "onBeforeSendHeaders") blockRes.push("requestHeaders");
    if (onWhat === "onHeadersReceived") blockRes.push("responseHeaders");
    chrome.webRequest[onWhat].addListener(
        (details) => {
            const url = a.getTabURL(details.tabId, details.frameId);
            if (!domList || a.domCmp(url, domList, isMatch)) {
                const response = server(details);

                //@pragma-if-debug
                if (a.debugMode && response) {
                    if (response.cancel) {
                        console.log("Cancelled " + details.url);
                    } else if (response.redirectUrl) {
                        console.log("Redirected " + details.url + " to " +
                            response.redirectUrl);
                    }
                }
                //@pragma-end-if

                return response;
            }
        },
        {
            urls: urls,
            types: types,
        },
        blockRes,
    );
};

/*****************************************************************************/

/**
 * Inject UserCSS.
 * @function
 * @param {integer} tab - The target tab.
 * @param {integer} frame - The target frame.
 * @param {string} code - The CSS code to inject.
 */
a.userCSS = (tab, frame, code) => {
    if (tab === chrome.tabs.TAB_ID_NONE) {
        return;
    }

    // TODO - Clean this up when minimum required version of Chrome is 66
    // or higher
    try {
        chrome.tabs.insertCSS(tab, {
            code: code,
            cssOrigin: "user",
            frameId: frame,
        }, a.noopErr);
    } catch (err) {
        chrome.tabs.insertCSS(tab, {
            code: code,
            frameId: frame,
        }, a.noopErr);
    }
};

/**
 * Send a cross origin XMLHttpRequest.
 * @function
 * @param {Object} details - Details about this request.
 *     @param {string} method - The method of the request, can be "GET" or
 *     "POST".
 *     @param {string} url - The URL of the request.
 *     @param {Object|undefined} [headers=undefined] - The headers of the
 *     request.
 *     @param {string|null} [payload=null] - The payload of the request.
 * @param {Function} onload - The load event handler.
 *     @param {string} response - The response text.
 * @param {Function} onerror - The error event handler.
 * @return {boolean} True if the request is sent, false if details are not
 * valid and the request was not sent.
 */
a.xhr = (details, onload, onerror) => {
    if (
        typeof details.method !== "string" ||
        typeof details.url !== "string"
    ) {
        return false;
    }
    if (
        details.method !== "GET" &&
        details.method !== "POST"
    ) {
        return false;
    }
    if (a.allowConsole)
        console.log("[Nano] Cross Origin Request ::", details.url);

    let req = new XMLHttpRequest();

    req.onreadystatechange = () => {
        if (req.readyState === XMLHttpRequest.DONE) {
            if (req.status === 200) {
                onload(req.responseText);
            } else {
                onerror();
            }
        }
    };

    req.open(details.method, details.url);

    if (typeof details.headers === "object") {
        for (const key in details.headers) {
            const header = details.headers[key];

            if (
                details.headers.hasOwnProperty(key) &&
                typeof header === "string"
            ) {
                req.setRequestHeader(key, header);
            }
        }
    }

    if (typeof details.payload === "string") {
        req.send(payload);
    } else {
        req.send(null);
    }

    return true;
};

/*****************************************************************************/

/**
 * Apply generic rules. Call once on start up.
 * @function
 */
a.generic = () => {
    a.staticServer(
        [
            "https://ads.korri.fr/index.js",
            "http://*.medianetworkinternational.com/js/advertisement.js*",
        ],
        [
            "script",
        ],
        a.rLink("jquery.js"),
    );
    /*
    // Not working correctly
    a.staticServer(
        [
            "https://imasdk.googleapis.com/js/sdkloader/ima3.js*",
            "http://imasdk.googleapis.com/js/sdkloader/ima3.js*",
        ],
        [
            "script",
        ],
        a.rLink("ima3.js"),
        // List whitelisted domains in the array
        // [
        // ],
        // false,
    );
    */
    a.staticServer(
        [
            "https://legacy.hugoxu.com/uBlockProtector/Solutions/MoatFreeWheelJSPEM.js",
            "https://*.moatads.com/*/MoatFreeWheelJSPEM.js*",
        ],
        [
            "script",
        ],
        a.rLink("fw.js"),
    );
};

/*****************************************************************************/

//@pragma-if-debug

/**
 * Attempt to make the server think the request is from a different IP. Rarely
 * works.
 * Only available in debug mode.
 * @function
 * @param {string} urls - The URLs to activate on.
 * @param {string} ip - The camouflage IP. Keep in mind that the server still
 * have access to your real IP.
 * @param {boolean} [log=false] - Whether details should be logged to console
 * for every matched request.
 */
a.proxy = (urls, ip, log) => {
    if (!a.debugMode) {
        console.error("a.proxy() is only available in debug mode!");
        return;
    }

    chrome.webRequest.onBeforeSendHeaders.addListener(
        (details) => {
            details.requestHeaders.push({
                name: "X-Forwarded-For",
                value: ip,
            });
            details.requestHeaders.push({
                name: "Client-IP",
                value: ip,
            });

            if (log) {
                console.log(details);
            }

            return { requestHeaders: details.requestHeaders };
        },
        {
            urls: urls,
        },
        [
            "blocking",
            "requestHeaders",
        ],
    );
};

//@pragma-end-if

/*****************************************************************************/
