mainSite.environment = function(_$) { // _$ = Virtual Environment
    _$.loadStyle('home/style.css');

    _$.el.for(document).addEventListener('click', function(event) {
        console.log("Works");
    });
};

mainSite.executeEnvironment();