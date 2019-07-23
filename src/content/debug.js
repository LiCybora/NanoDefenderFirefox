// ----------------------------------------------------------------------------------------------------------------- //

// Nano Defender - An anti-adblock defuser
// Copyright (C) 2016-2019  Nano Defender contributors
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

// ----------------------------------------------------------------------------------------------------------------- //

// Content rules for debugging
// Only run in debug mode

// ----------------------------------------------------------------------------------------------------------------- //

"use strict";

// ----------------------------------------------------------------------------------------------------------------- //

// ----------------------------------------------------------------------------------------------------------------- //

// Tools

// ------------------------------------------------------------------------------------------------------------- //

// Force Twitch to show debug logs
if (a.domCmp([
    "twitch.tv",
], true)) {
    a.readOnly("log", "window.nanoConsole.log.bind(window.nanoConsole)", "window.nanoConsole");
    a.readOnly("warn", "window.nanoConsole.warn.bind(window.nanoConsole)", "window.nanoConsole");
    a.readOnly("error", "window.nanoConsole.error.bind(window.nanoConsole)", "window.nanoConsole");
}

// ------------------------------------------------------------------------------------------------------------- //

// ----------------------------------------------------------------------------------------------------------------- //

// Rules

// ------------------------------------------------------------------------------------------------------------- //

// https://github.com/NanoAdblocker/NanoFilters/issues/218
if (a.domCmp([
    "di.fm",
    "jazzradio.com",
])) {
    a.loopbackXHR((ignored, url) => {
        if (url.startsWith("https://pubads.g.doubleclick.net/")) {
            return [
                '<?xml version="1.0" encoding="UTF-8"?>',
                '<VAST xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="vast.xsd" version="3.0">',
                '</VAST>',
            ].join("\n");
        }
    });
}

// ------------------------------------------------------------------------------------------------------------- //


// https://github.com/NanoMeow/QuickReports/issues/352
// https://github.com/uBlockOrigin/uAssets/issues/4290
// https://github.com/jspenguin2017/uBlockProtector/pull/1045
if (a.domCmp([
    "gamer.com.tw",
])) {
    a.inject(() => {
        "use strict";

        const _XMLHttpRequest = window.XMLHttpRequest;

        const patchPlayer = (src) => {
            const adsTimerOffset = /<Linear skipoffset=.*?>/;
            let adsTimerPrompt =
                    /\w\.innerHTML='<p class="vast-skip-button-text">'\+window\._molSettings\.skipText.*?"<\/p>"/g;
            let adsSkipPrompt = /\w\.innerHTML=window\._molSettings\.skipButtonText/g;
            const req = new _XMLHttpRequest();
            req.onreadystatechange = () => {
                if (req.readyState === 4) {
                    let payload = req.responseText;
                    try {
                        payload = payload.replace(adsTimerOffset, '<Linear skipoffset="00:00:08">');
                        payload = payload.replace(adsSkipPrompt, [
                            "$('.vast-skip-button.enabled')[0].click()",
                            "$('#ani_video_html5_api').show()",
                            "$('#ani_video_html5_api').prop('muted', false)",
                        ].join(","));
                        payload = payload.replace(adsTimerPrompt, (match) => {
                            return "(" + [
                                match,
                                "$('#ani_video_html5_api').hide()",
                                "$('#ani_video_html5_api').prop('muted', true)",
                            ].join(",") + ")";
                        });
                    } catch (err) { }
                    const script = window.document.createElement("script");
                    script.textContent = payload;
                    window.document.body.append(script);
                }
            };
            req.open("GET", src);
            req.send();
        };

        const _appendChild = window.Element.prototype.appendChild;
        window.Element.prototype.appendChild = function (elem) {
            if (
                elem.tagName === "SCRIPT" &&
                elem.src &&
                elem.src.startsWith("https://i2.bahamut.com.tw/build/js/animeplayer")
            ) {
                return void patchPlayer(elem.src);
            }
            return _appendChild.apply(this, arguments);
        };
    });
}

// ------------------------------------------------------------------------------------------------------------- //

// ----------------------------------------------------------------------------------------------------------------- //

// ----------------------------------------------------------------------------------------------------------------- //
