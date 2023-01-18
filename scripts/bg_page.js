chrome.runtime.onMessage.addListener(
    function(data, sender, onSuccess) {
        if (data.endpoint) {
            // Sent POST request
            chrome.storage.local.get(["token"]).then((result) => { 
                fetch('https://zp.danishhumair.com/' + data.endpoint, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Auth-Token': result.token
                    },
                    body: data.data
                })
                .then(response => response.text())
                .then(responseText => onSuccess(responseText));
            });

            if (data.endpoint == "get_colors") {
                // Save roll number for verification email
                chrome.storage.local.set({ roll: JSON.parse(data.data).roll_no });
            } else if (data.endpoint == "verify") {
                // Remember to re-open code entry page
                isCode = true;
            }

        } else if (data.query) {

            if (data.query == "roll") {
                // Send roll number
                chrome.storage.local.get(["roll"]).then((result) => { onSuccess(result.roll); });
            } else if (data.query == "isCode") {
                // Tell if code entry in progress
                onSuccess(isCode);
            } else if (data.query == "delToken") {
                // Delete token
                chrome.storage.local.set({ token: "" });
            } else if (data.query == "noCode") {
                // Code entry done
                isCode = false;
            }
            
        } else if (data.token) {
            chrome.storage.local.set({ token: data.token });
        }

        return true;  // Will respond asynchronously
    }
);

chrome.runtime.onInstalled.addListener(function (object) {
    let externalUrl = "http://danishhumair.com/zambeel-plus/installed/v"+chrome.runtime.getManifest().version;
    if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        chrome.tabs.create({ url: externalUrl }, function (tab) {console.log("[!] Extension installed");});
    } else if (object.reason === chrome.runtime.OnInstalledReason.UPDATE) {
        chrome.tabs.create({ url: externalUrl }, function (tab) {console.log("[!] Extension installed");});
    }
});
