chrome.runtime.onMessage.addListener(
    function(data, sender, onSuccess) {
        fetch('https://zp.danishhumair.com/' + data.endpoint, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: data.data
            })
            .then(response => response.text())
            .then(responseText => onSuccess(responseText));
        return true;  // Will respond asynchronously.
    }
);
