chrome.runtime.onMessage.addListener(
    function(data, sender, onSuccess) {
        fetch('https://zp.danishhumair.com/' + data[0], {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: data[1]
            })
            .then(response => response.text())
            .then(responseText => onSuccess(responseText));
        return true;  // Will respond asynchronously.
    }
);
