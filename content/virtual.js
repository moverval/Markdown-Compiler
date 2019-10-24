class ListenerScreen {
    constructor() {
        this.map = new Map();
    }

    for(element) {
        if(!this.map.has(element))
            this.map.set(element, new VWebListener(element));
        return this.map.get(element);
    }

    unload() {
        let success = true;
        this.map.forEach(function(webListener) {
            if(!webListener.unload())
                success = false;
        });
        return success;
    }
}

class VWebListener {
    constructor(element) {
        this.element = element;
        this.el = new VListener();
        this.el.setRegisterFunction(this.vListenerRegister(element));
        this.el.setUnregisterFunction(this.vListenerUnregister(element));
    }

    vListenerRegister(element) {
        return function(evtName) {
            const listener = this.eventFunction(evtName);
            element.addEventListener(evtName, listener);
            return listener;
        }
    }

    vListenerUnregister(element) {
        return function(evtName) {
            element.removeEventListener(evtName, this.registeredListeners[evtName]);
            return true;
        }
    }

    addEventListener = (evtName, listener) => this.el.addEventListener(evtName, listener);

    unload = () => this.el.unload();
}

class VListener {
    constructor() {
        this.listenerType = "undefined";
        this.registerFunction = undefined;
        this.unregisterFunction = undefined;
        this.registerMap = {};
        this.registeredListeners = {};
    }

    addToEvent(evtName, value) {
        if(!this.registerMap[evtName])
            this.registerMap[evtName] = [];
        
        this.registerMap[evtName].push(value);
    }

    eventFunction(name) {
        const pthis = this; // pointer
        return function(...event) {
            if(pthis.registerMap[name]) {
                pthis.registerMap[name].forEach(function(evtFunc) {
                    try {
                        evtFunc(...event);
                    } catch(Error) {
                        console.error("Error occurred! : \n" + Error);
                    }
                });
                return true;
            }
            else return false;
        }
    }

    setRegisterFunction(func) {
        this.registerFunction = func;
    }

    setUnregisterFunction(func) {
        this.unregisterFunction = func;
    }

    unload() {
        if(typeof this.unregisterFunction !== 'function') return false;
        let failed = false;
        for(const point in this.registerMap) {
            if(!this.unregisterFunction(point)) failed = true;
        }

        return !failed;
    }

    addEventListener(evtName, listener) {
        if(!this.registeredListeners[evtName]) {
            if(typeof this.registerFunction !== 'function') return false;
            let listener;
            if(!(listener = this.registerFunction(evtName))) return false;
            this.registeredListeners[evtName] = listener;
        }
        this.addToEvent(evtName, listener);
        return true;
    }
}

class VTool {
    constructor(service) {
        this.headElement = document.getElementsByTagName('head')[0];
        this.loadedContent = {
            scripts: {},
            styles: {}
        };
        this.service = service | 'undefined';
        this.el = new ListenerScreen();
        //this.initListener();
    }

    initListener() {
        this.el.setRegisterFunction(this.vListenerRegister);
        this.el.setUnregisterFunction(this.vListenerUnregister);
    }

    vListenerRegister(evtName) {
        const listener = this.eventFunction(evtName);
        document.addEventListener(evtName, listener);
        return listener;
    }

    vListenerUnregister(evtName) {
        document.removeEventListener(evtName, this.registeredListeners[evtName]);
        return true;
    }

    loadScript(path) {
        if(!this.loadedContent.scripts[path]) {
            const script = document.createElement('script');
            script.src = path;
            this.headElement.appendChild(script);
            this.loadedContent.scripts[path] = script;
            return new Promise(resolve => {
                script.onload = function() {
                    resolve(true);
                }
            });
        }
        else return new Promise(resolve => resolve(false));
    }

    unloadScript(path) {
        if(this.loadedContent.scripts[path]) {
            this.headElement.removeChild(this.loadedContent.scripts[path]);
            this.loadedContent.scripts[path] = undefined;
            return true;
        }
        else return false;
    }

    loadStyle(path) {
        if(!this.loadedContent.styles[path]) {
            const style = document.createElement('link');
            style.href = path;
            style.rel = 'stylesheet';
            this.headElement.appendChild(style);
            this.loadedContent.styles[path] = style;
            new Promise(resolve => {
                style.onload = function() {
                    resolve(true);
                };
            });
        }
        else return new Promise(resolve => resolve(false));
    }

    unloadStyle(path) {
        if(this.loadedContent.styles[path]) {
            this.headElement.removeChild(this.loadedContent.styles[path]);
            this.loadedContent.styles[path] = undefined;
            return true;
        }
        else return false;
    }

    unload() {
        for(const scriptPath in this.loadedContent.scripts) {
            this.unloadScript(scriptPath);
        }
        for(const stylePath in this.loadedContent.styles) {
            this.unloadStyle(stylePath);
        }
        return this.el.unload(); // true && this.el.unload
    }
}

class VSite {
    constructor() {
        this.path = "";
        this.domElement = document.createElement('div');
        this.domElement.classList.add('vbody');
        this._$ = undefined;
        this.environment = undefined;
    }

    getElement() {
        return this.domElement;
    }

    executeEnvironment() {
        if(typeof this.environment === 'function') {
            try {
                const value = this.environment(this._$); // Execution
                if(typeof value === 'boolean') {
                    if(!value) {
                        console.log("Internal error. Environment " + this._$.service);
                    }
                }
            } catch(Error) {
                console.log("Error catched in Environment " + this._$.service + "\n\n" + Error);
            }
        }
    }

    async setSite(path) {
        if(this._$)
            this.clearSite();
        this.path = path;
        const content = await fetch(this.path);
        this._$ = new VTool(path);
        this.domElement.innerHTML = await content.text();
        return true;
    }

    clearSite() {
        this.domElement.innerHTML = "";
        this.environment = undefined;
        const rtn = this._$.unload();
        this._$ = undefined;
        return rtn;
    }
}