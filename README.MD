# Important Announcements Regarding Recent Changes

**Important: As of v15.0.0.206, this port has NO RELATIONSHIP to upstream anymore. Any product released as Nano Defender on everywhere else other than AMO and this repository are not related to me! My account on both AMO and GitHub are LiCybora. Note that the product name is `Nano Defender for Firefox` and `Nano Defender Pro` on AMO and GitHub respectively, not `Nano Defender`!**

The project is now 100% independent as upstream is archived. Any other product named Nano Defender has no relationship to me.

For more information, please read [my thread](https://github.com/LiCybora/NanoDefenderFirefox/issues/187) and announcements from upstream [here](https://github.com/NanoAdblocker/NanoCore/issues/362)

# Nano Defender for Firefox

An anti-adblock defuser for Nano Adblocker and uBlock Origin on Firefox

![Popup Panel Screenshot](https://raw.githubusercontent.com/LiCybora/NanoDefenderFirefox/master/screenshot.png)

## About Firefox port

<del>The source code of this project is shared from [upstream](https://github.com/jspenguin2017/uBlockProtector).</del>

As of v15.0.0.206, Nano Defender for Firefox is independent from any entites or people. Note that the product name is `Nano Defender for Firefox` and `Nano Defender Pro` on AMO and GitHub respectively, not `Nano Defender`!

For issues other than filter issues found on Firefox port, it is recommended to report [here](https://github.com/LiCybora/NanoDefenderFirefox/issues).

### Notable changes

#### Disable console log (since v15.0.0.93)

You may disable console log for this browser session in the popup (see the first row of screenshot). This option will turn on again when you restart browser session. Please note that console filtering with -[Nano] will **NOT** work for Firefox.

## Installation

Nano Defender can only protect <del>either [Nano Adblocker](https://github.com/LiCybora/NanoCoreFirefox) or</del> [uBlock Origin](https://github.com/gorhill/ublock)<del>, and will prioritize Nano Adblocker.</del> As of 17 Oct 2020, Nano Adblocker is no more.

### [Get Nano Defender Pro (for Waterfox/Firefox 55 or above)](https://github.com/LiCybora/NanoDefenderFirefox/releases/)

### [Get Nano Defender for Firefox on AMO (Recommend, ONLY for Firefox 60 or above)](https://addons.mozilla.org/en-US/firefox/addon/nano-defender-firefox/)

The 'Pro' version will strictly follow the Pro version in upstream, while the 'for Firefox' version may add/replace rules with [Firefox-specific API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/filterResponseData), or [remove the potential dangerous rules](https://extensionworkshop.com/documentation/develop/build-a-secure-extension/).

**IMPORTANT: DO NOT install both versions.**

Note: If you are using uBlock Origin, there are a few [extra installation steps](https://jspenguin2017.github.io/uBlockProtector/#extra-installation-steps-for-ublock-origin) to follow.

### About Pre-quantum fork

ONLY Waterfox 55 or above, or forks with equivalent gecko version and supporting WebExtension API can install the 'Pro' version.
However, some functions are lacking (such as console switch and response data filtering).

**No support for other pre-quantum forks without WebExtension API (such as Basilisk, Palemoon).**

## Building

Nano Defender for Firefox is built using
[Nano Build (Modded)](https://github.com/LiCybora/NanoBuild).

## Credits

Nano Defender uses open source code from the following projects (alphabetical):

[reek/anti-adblock-killer](https://github.com/reek/anti-adblock-killer)

[primer/octicons](https://github.com/primer/octicons/)

[uBlockOrigin/uAssets](https://github.com/uBlockOrigin/uAssets)

[gorhill/uBlock](https://github.com/gorhill/uBlock)

[gorhill/uBO-Extra](https://github.com/gorhill/uBO-Extra)

## Special Thanks

Nano Defender is developed by **@jspenguin2017** with the help of the following
individuals (alphabetical):

**@lain566**
