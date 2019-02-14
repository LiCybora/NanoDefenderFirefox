/**
 * Patching out all console message.
 */
"use strict";

window.nanoConsole = window.console;
a.inject(() => {
    "use strict";
	window.nanoConsole = window.console;
});



