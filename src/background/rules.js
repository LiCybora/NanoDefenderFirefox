/**
 * Background rules.
 */
"use strict";

a.init();
a.generic();

{
    // shorte.st and related domains
    // https://github.com/jspenguin2017/uBlockProtector/issues/169
    chrome.webRequest.onBeforeSendHeaders.addListener(
        (details) => {
            let asyncRewrite = new Promise((resolve, reject) => {
                setTimeout(() => {
                    for (let i = 0; i < details.requestHeaders.length; i++) {
                        if (details.requestHeaders[i].name === "User-Agent") {
                            details.requestHeaders.splice(i, 1);
                            break;
                        }
                    }
                    resolve({requestHeaders: details.requestHeaders});
                }, 2000)
            });
            return asyncRewrite;
        },
        {
            urls: [
                "*://shorte.st/*",
                "*://5k4i.com/*",
                "*://ceesty.com/*",
                "*://clkme.me/*",
                "*://clkmein.com/*",
                "*://cllkme.com/*",
                "*://corneey.com/*",
                "*://destyy.com/*",
                "*://festyy.com/*",
                "*://gestyy.com/*",
                "*://pj45.com/*",
                "*://sh.st/*",
                "*://viid.me/*",
                "*://wiid.me/*",
                "*://xiw34.com/*",
                "*://iklan.master-cyber.com/*",
                "*://links.orgasmatrix.com/*",
                "*://wik34.com/*",
                "*://zryydi.com/*",
                "*://skiip.me/*",
            ],
            types: [
                "main_frame",
                "sub_frame",
            ],
        },
        [
            "blocking",
            "requestHeaders",
        ],
    );
}
{
    // https://github.com/jspenguin2017/uBlockProtector/issues/398
    // https://gitlab.com/xuhaiyang1234/NanoAdblockerSecretIssues/issues/12
    // https://github.com/AdguardTeam/AdguardFilters/issues/6718
    a.staticServer(
        [
            "*://ads-v-darwin.hulustream.com/published/*.mp4*",
            "*://*.ads-v-darwin.hulustream.com/published/*.mp4*",
        ],
        [
            "media",
        ],
        a.blankMP4,
        [
            "hulu.com",
        ],
        true,
    );
}
