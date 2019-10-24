const { remote, ipcRenderer } = require('electron');

const PROGRAM_NAME = "Marker";

const closeButton = document.getElementById('close-button');
const maximizeButton = document.getElementById('maximize-button');
const minimizeButton = document.getElementById('minimize-button');
const mainContent = document.getElementById('_main-content');

const loadingScreen = document.getElementById('load-screen');
const loaderOutputContainer = document.getElementById('_loader__output__container');

const titlebarText = document.getElementById('_titlebar__text');

const maximizeNotSupportedPopout = document.getElementById('maximize-not-supported');

closeButton.onclick = function() {
    remote.app.quit();
};

minimizeButton.onclick = function() {
    remote.getCurrentWindow().minimize();
};

let timeoutMaximizeButtonNotSupported;
maximizeButton.onclick = function() {
    maximizeNotSupportedPopout.classList.add('active');
    if(timeoutMaximizeButtonNotSupported)
        clearTimeout(timeoutMaximizeButtonNotSupported);
    timeoutMaximizeButtonNotSupported = setTimeout(function() {
        maximizeNotSupportedPopout.classList.remove('active');
    }, 5000);
};

function addLoadingText(message) {
    console.log("Loader: " + message);
    const text = document.createElement('p');
    text.innerText = message;
    text.classList.add("load-text");
    loaderOutputContainer.insertAdjacentElement('beforeend', text);
}

function setLoadingScreen(bool) {
    if(bool) {
        loadingScreen.style.display = 'block';
        setTimeout(function() {
            loadingScreen.classList.remove('noload');
        }, 300);
    }
    else {
        loadingScreen.classList.add('noload');
        setTimeout(function() {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

ipcRenderer.on('loadingMessage', function(event, message) {
    addLoadingText(message);
});

const mainSite = new VSite();
mainContent.appendChild(mainSite.getElement());

addLoadingText("loading fonts");
const fonts = document.createElement('link');
fonts.onload = async function() {
    addLoadingText("fonts loaded");
    addLoadingText("adding fontawesome icons");
    const fontawesome = document.createElement('script');
    fontawesome.onload = async function() {
        addLoadingText("icons loaded");
        setTimeout(async function() {
            addLoadingText("Loading site content");
            mainSite.setSite("./home/index.html").then(async function(result) {
                if(result) {
                    await mainSite._$.loadScript("./home/script.js");
                    addLoadingText("Content loaded with success");
                    setTimeout(function() {
                        setLoadingScreen(false);
                        titlebarText.innerText = PROGRAM_NAME;
                        titlebarText.style.transition = "opacity .3s ease";
                        titlebarText.style.fontFamily = 'Poppins';
                        titlebarText.style.opacity = '1';
                    }, 300);
                }
                else {
                    addLoadingText("Error at loading content");
                }
            });
        }, 300);
    };
    fontawesome.src = "https://kit.fontawesome.com/1aacbb0484.js";
    fontawesome.crossOrigin = "anonymous";
    document.head.appendChild(fontawesome);
};
fonts.href = "https://fonts.googleapis.com/css?family=Poppins:300,400,500|Roboto:300,400,500&display=swap";
fonts.rel = "stylesheet";
document.head.appendChild(fonts);