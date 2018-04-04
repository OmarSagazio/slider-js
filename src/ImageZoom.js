class ImageZoom {

    // =constructor
    constructor() {
        window.addEventListener("load", this.init.bind(this));
    }

    // =init
    init() {
        
        // ---------------------------------------------------
        //  1. replace urls to point to the original ones
        // ---------------------------------------------------
        const links = Array.from(document.getElementsByClassName("img-zoom"));

        const urls = links.map(img => {
            var urlSplitted = img.href.split("_");
            urlSplitted[2] = "0";
            urlSplitted[3] = "0";
            urlSplitted[4] = urlSplitted[4].replace(/[0-9]*/, "0");

            return urlSplitted.join("_");
        });

        

        // -----------------------------------------
        //      Fetch Original Urls
        //      
        //  =fetch-urls =original =urls
        // -----------------------------------------

        var myHeaders = new Headers({
            'Content-Type': 'text/plain',
            'X-Custom-Header': 'hello world'
            // X-RC-imgsize
          });
          
          fetch('/someurl', {
            headers: myHeaders
          });

        // urls.forEach(
            url => fetch(url, {
                method: 'HEAD'
            })
            .then(
                response => console.log(response)
            )
        // );


        // ---------------------------------------------------
        //  Change a.href -> class: fancybox, img-zoom
        // ---------------------------------------------------
        function getOriginalUrl(link) {
            var urlSplitted = link.href.split("_");
            urlSplitted[2] = "0";
            urlSplitted[3] = "0";
            urlSplitted[4] = urlSplitted[4].replace(/[0-9]*/, "0");

            return urlSplitted.join("_");
        }

        links.forEach(
            link => link.href = getUrl(link)
        );

    }


}


// =start-app
new ImageZoom();