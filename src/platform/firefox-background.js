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
            };
        },
        [
            "v.qq.com",
        ],
        true,
    );
    // https://github.com/uBlockOrigin/uAssets/issues/4290
    a.dynamicServer(
        [
            "*://*.bahamut.com.tw/*/animeplayer*",
        ],
        [
            "script",
        ],
        (details) => {
            let payload = "";

            // Force disable cache due to a Firefox bug
            // See https://github.com/LiCybora/NanoDefenderFirefox/issues/108
            let cache = false;
            for (var header of details.requestHeaders) {
                if (header.name === "Cache-Control") {
                    header.value = "no-cache, no-store, must-revalidate";
                    cache = true;
                    break;
                }
            }
            if (!cache) {
                details.requestHeaders.push({name: "Cache-Control", value:"no-cache, no-store, must-revalidate"});
            }
            
            let decoder = new TextDecoder("utf-8");
            let encoder = new TextEncoder();
            
            let filter = browser.webRequest.filterResponseData(details.requestId);

            filter.ondata = (e) => {
                payload += decoder.decode(e.data, { stream: true });
            };

            filter.onstop = () => {
                try {
                    let adsTimer = '30"><Duration>00:00:05';
                    let duringAds = /\D{1}\.innerHTML=\"廣告(.*)消除廣告(.*)？\"/;
                    let skipAds = /\D{1}\.innerHTML=\"點此跳過廣告\"/;
                    payload = payload.replace(adsTimer, `03"><Duration>00:00:00`
                        ).replace(skipAds,`$(".vast-skip-button")[0].click(),$("#ani_video_html5_api").show(),$("#ani_video_html5_api").prop("muted", !1)`
                        ).replace(duringAds, `(${payload.match(duringAds)[0]},$("#ani_video_html5_api").hide(),$("#ani_video_html5_api").prop("muted", !0))`);
                                        
                } catch (err) {
                    if (a.allowConsole) {
                        console.log(err);
                    }
                }                
                filter.write(encoder.encode(payload));
                filter.disconnect();
            };
            return {requestHeaders: details.requestHeaders};
        },
        [
            "ani.gamer.com.tw",
        ],
        true,
        "onBeforeSendHeaders",
    );
}
