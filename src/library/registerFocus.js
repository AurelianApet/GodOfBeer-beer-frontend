var hidden = "hidden";

// Standards:
if (hidden in document)
    document.addEventListener("visibilitychange", onchange);
else if ((hidden = "mozHidden") in document)
    document.addEventListener("mozvisibilitychange", onchange);
else if ((hidden = "webkitHidden") in document)
    document.addEventListener("webkitvisibilitychange", onchange);
else if ((hidden = "msHidden") in document)
    document.addEventListener("msvisibilitychange", onchange);
// IE 9 and lower:
else if ('onfocusin' in document)
    document.onfocusin = document.onfocusout = onchange;
// All others:
else
    window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onchange;

function onchange (evt) {
    var v = 'visible', h = 'hidden',
        evtMap = { 
            focus:v, focusin:v, pageshow:v, blur:h, focusout:h, pagehide:h 
        };

    evt = evt || window.event;
    if (evt.type in evtMap)
        document.body.className = evtMap[evt.type];
    else {      
        document.body.className = this[hidden] ? "hidden" : "visible";        
        console.log('windows activated', document.body.className);
    }
}

export const initFocusState = () => {
  // set the initial state
  onchange({type:(document.visibilityState === "visible") ? "focus" : "blur"})
}
