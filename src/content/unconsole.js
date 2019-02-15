/**
 * Patching out all console message.
 */
"use strict";

window.nanoConsole = {};
window.nanoConsole.log = () => { };
window.nanoConsole.warn = () => { };
window.nanoConsole.error = () => { };
a.inject(() => {
    "use strict";
    window.nanoConsole = {};
    window.nanoConsole.log = () => { };
	window.nanoConsole.warn = () => { };
	window.nanoConsole.error = () => { };
	window.nanoConsole.trace = () => { };

});



