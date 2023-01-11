chrome.runtime.onMessage.addListener(
    function(jsondata, sender, onSuccess) {
        fetch('https://zp.danishhumair.com/add_mark', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: jsondata
            })
            .then(response => response.text())
            .then(responseText => onSuccess(responseText))
        return true;  // Will respond asynchronously.
    }
);
