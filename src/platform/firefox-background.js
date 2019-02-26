/**
 * Special background script for Firefox.
 */
"use strict";

{
    // https://github.com/jspenguin2017/uBlockProtector/issues/660
    a.dynamicServer(
        [
            "*://*.uplynk.com/preplay/*",
        ],
        [
            "xmlhttprequest",
        ],
        (details) => {
            let payload = "";

            let filter = browser.webRequest.filterResponseData(details.requestId);
            let decoder = new TextDecoder("utf-8");
            let encoder = new TextEncoder();

            filter.ondata = (e) => {
                payload += decoder.decode(e.data, { stream: true });
            };
            filter.onstop = () => {
                try {
                    payload = JSON.parse(payload);
                } catch (err) {
                    filter.write(encoder.encode(payload));
                    filter.disconnect();
                    return;
                }

                //@pragma-if-debug
                if (a.debugMode) {
                    console.log(payload.ads);
                }
                //@pragma-end-if

                payload.ads = {
                    breakOffsets: [],
                    breaks: [],
                    placeholderOffsets: [],
                };

                filter.write(encoder.encode(JSON.stringify(payload)));
                filter.disconnect();
            };
        },
        [
            "fox.com",
        ],
        true,
    );
    // https://github.com/uBlockOrigin/uAssets/issues/4293
    a.dynamicServer(
        [
            "*://vd.l.qq.com/proxyhttp?*",
        ],
        [
            "script",
        ],
        (details) => {
            let payload = "";

            let filter = browser.webRequest.filterResponseData(details.requestId);
            let decoder = new TextDecoder("utf-8");
            let encoder = new TextEncoder();

            filter.ondata = (e) => {
                payload += decoder.decode(e.data, { stream: true });
            };
            filter.onstop = () => {
                try {
                    let jsonData = payload.match(/\((.*)\)/)[1];
                    let leftover = payload.replace(jsonData, "HOLDER");

                    jsonData = JSON.parse(jsonData);
                    if ("ad" in jsonData) {
                        delete jsonData.ad;
                        payload = leftover.replace("HOLDER", JSON.stringify(jsonData));
                    } else {
                        throw "Nothing can be filter";
                    }
                } catch (err) {
                    if (a.allowConsole) {
                        console.log(err);  
                    }
                }
                filter.write(encoder.encode(payload));
                filter.disconnect();
                return;
            };
        },
        [
            "v.qq.com",
        ],
        true,
    );
}
