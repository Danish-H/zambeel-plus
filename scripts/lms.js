function injectJSZip(callback) {
    if (window.JSZip) {
        callback();
        return;
    }

    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('scripts/jszip.min.js');
    script.onload = callback;
    document.head.appendChild(script);
}

function mainScript() {
    if (document.title.split(" : ")[2] != "Resources") return;

    (function() {
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('scripts/jszip.min.js');
        document.head.appendChild(script);
    })();
    console.log("ADDED SCRIPT")

    async function fetchFile(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch');
            }
            const data = await response.arrayBuffer();
            return data;
        } catch (error) {
            console.error(`Failed to download ${url}`, error);
            return null;
        }
    }

    function extractURLFromOnClick(onClickValue) {
        const match = onClickValue.match(/openCopyrightWindow\('([^']+)'/);
        if (!match) return null;
        
        const originalURL = match[1];
        return `${originalURL.replace("/access/", "/access/accept?ref=")}&url=${originalURL.split('/access')[1]}`;
    }

    async function createZip() {
        const specialLinks = Array.from(document.querySelectorAll('td.specialLink > a:not(.fa)'));
    
        const fileLinks = specialLinks.filter(linkElem => {
            if (linkElem.parentElement.textContent.includes('©')) {
                const modifiedURL = extractURLFromOnClick(linkElem.getAttribute('onclick'));
                if (modifiedURL) {
                    linkElem.href = modifiedURL;
                    return true;
                }
            }
    
            const link = linkElem.href;
            const parts = link.split('/group/');
            const pathParts = parts[1] ? parts[1].split('/') : [];
            const filePath = decodeURIComponent(pathParts.join('/'));
            return filePath.includes('.');
        });
    
        const zip = new JSZip();
        const totalFiles = fileLinks.length;
        const courseTitle = decodeURIComponent(document.title.split(" : ")[1]);
    
        const loadingElem = document.createElement('div');
        loadingElem.style.position = 'fixed';
        loadingElem.style.top = '10px';
        loadingElem.style.left = '50%';
        loadingElem.style.transform = 'translateX(-50%)';
        loadingElem.style.background = 'rgba(0,0,0,0.8)';
        loadingElem.style.padding = '10px';
        loadingElem.style.borderRadius = '5px';
        loadingElem.style.zIndex = '10000';
        loadingElem.style.color = '#ddd';
        document.body.appendChild(loadingElem);
    
        let count = 0;
        for (const linkElem of fileLinks) {
            const link = linkElem.href;
            const parts = link.split('/group/');
            const pathParts = parts[1] ? parts[1].split('/') : [];
    
            pathParts[0] = courseTitle;
            const filePath = decodeURIComponent(pathParts.join('/'));
                
            loadingElem.textContent = `Downloading and adding ${count + 1} of ${totalFiles}`;

            const progressIndicator = document.createElement('span');
            progressIndicator.textContent = 'Downloading... ';
            progressIndicator.style.color = '#cfe2f3';
            linkElem.parentElement.insertBefore(progressIndicator, linkElem);

            const fileData = await fetchFile(link);
            zip.file(filePath, fileData);

            if (fileData) {
                zip.file(filePath, fileData);
                progressIndicator.textContent = 'Downloaded ✓ ';
                progressIndicator.style.color = '#b6d7a8';
            } else {
                progressIndicator.textContent = 'Skipped ✖ ';
                progressIndicator.style.color = '#ea9999';
            }
            count++;
        }

        loadingElem.textContent = `Creating zip file...`;
    
        zip.generateAsync({type:"blob"}).then(function(content) {
            const a = document.createElement('a');
            const url = window.URL.createObjectURL(content);
            a.href = url;
            a.download = `${courseTitle}.zip`;
            a.click();
            loadingElem.remove();
        });
    }
    
    function addDownloadButton() {
        console.log("Adding download button");
        buttonAdded = true;
        const navbar = document.querySelector(".Mrphs-toolTitleNav__button_container");
        if (!navbar) return;

        const btn = document.createElement("button");
        btn.textContent = "Download All";
        btn.style.marginRight = "10px";

        btn.addEventListener('click', createZip);

        navbar.insertBefore(btn, navbar.firstChild);
    }

    function addExpandButton() {
        const navbar = document.querySelector(".Mrphs-toolTitleNav__button_container");
        if (!navbar) return;

        const btn = document.createElement("button");
        btn.textContent = "Download (Expand List)";
        btn.style.marginRight = "10px";

        btn.addEventListener('click', function() {
            const form = document.getElementById('showForm');
            document.getElementById('sakai_action').value = 'doExpandall';
            document.getElementById('collectionId').value = `/group/${document.location.pathname.match(/\/site\/(.*?)\/tool\//)[1]}/`;
            form.submit();
        });

        navbar.insertBefore(btn, navbar.firstChild);
    }

    const expansionElement = document.querySelector('#expansion a');
    if (expansionElement && expansionElement.title === "Collapse All") {
        addDownloadButton();
    } else {
        addExpandButton();
    }
}

mainScript();
