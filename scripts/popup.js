document.getElementById("version_no").innerHTML = "v"+chrome.runtime.getManifest().version;
var roll;
var currentPage = null;
currentPage = toPage();

function toPage(toPage="default") {
    if (currentPage) { document.getElementById(currentPage).style.display = "none"; }
    document.getElementById(toPage).style.display = "block";
    return toPage;
}

function start() {
    // Check if saved token valid
    chrome.runtime.sendMessage(
        {
            endpoint: "check_token",
            data: JSON.stringify({ roll_no: roll })
        },
        data => {
            // Skip to verified if valid, start verification if invalid
            if (data == "very good") {  currentPage = toPage("verified"); }
            else if (data == "bad") { startVerify(); }
        }
    );
}

function startVerify() {
    // Check if email detected
    chrome.runtime.sendMessage(
        { query: "roll" },
        data => {
            roll = data;
            // Check if roll number detected from content script
            if (roll < 20000000 || roll > 30000000) {
                currentPage = toPage("refresh");
            } else {
                document.getElementById("email_addr").innerHTML = data + "@lums.edu.pk";
                currentPage = toPage("verify");
                chrome.runtime.sendMessage({ query: "isCode" }, data => { if (data) { verify(); }});
            }
        }
    );
}

function verify() {
    currentPage = toPage("code");

    // Collect all text-boxes
    const inputElements = [...document.querySelectorAll('input.code-input')];

    inputElements.forEach((box, index)=>{
        box.addEventListener('keydown', (e) => {
            // In case of backspace
            if(e.keyCode == 8 && e.target.value == '') {
                inputElements[Math.max(0,index-1)].focus();
            }
        })
        box.addEventListener('input', (e) => {
            // Take first character of input
            const [first,...rest] = e.target.value;
            e.target.value = first ?? '';
            const lastInputBox = index == inputElements.length-1;
            const didInsertContent = first != undefined;
    
            if(didInsertContent) {
                if(!lastInputBox) {
                    // Continue to input the rest of the string
                    inputElements[index+1].focus();
                    inputElements[index+1].value = rest.join('');
                    inputElements[index+1].dispatchEvent(new Event('input'));
                } else {
                    checkCode(inputElements.map(({value})=>value).join(''));
                }
            }
        })
    });
}

function checkCode(code) {
    // Check if code entered is correct
    chrome.runtime.sendMessage(
        {
            endpoint: "check_code",
            data: JSON.stringify({
                roll_no: roll,
                code: code
            })
        },
        data => {
            try {
                saveToken(JSON.parse(data).token);
            } catch(err) {
                document.getElementById("code_err").innerHTML = data;
                console.log("[!] Did not get a valid response from API!");
            }
        }
    );
}

function saveToken(t) {
    // Save token in storage and disable code entry flag
    chrome.runtime.sendMessage({ token: t });
    chrome.runtime.sendMessage({ query: "noCode" });
    currentPage = toPage("verified");
}

function error(id, err) {
    // Print error (e.g. rate limiting)
    document.getElementById(id+"_err").innerHTML = err;
}

document.getElementById("btn_verify").onclick = () => {
    document.getElementById("btn_verify").innerHTML = "Sending code...";
    chrome.runtime.sendMessage(
        {
            endpoint: "verify",
            data: JSON.stringify({ roll_no: roll })
        },
        data => {
            // Attempt to start verification
            if (data == "very good") { verify(); }
            else { error("verify", data); }
            document.getElementById("btn_verify").innerHTML = "Verify";
        }
    );
}

document.getElementById("btn_signout").onclick = () => {
    // Request to delete token remotely and locally
    chrome.runtime.sendMessage(
        {
            endpoint: "delete_token",
            data: JSON.stringify({ roll_no: roll })
        },
        data => {
            try {
                if (data == "done") {
                    chrome.runtime.sendMessage(
                        { query: "delToken" },
                        data => { console.log("[!] Token deleted locally"); }
                    );
                    startVerify();
                } else {
                    error("verified", data);
                }
            } catch(err) {
                console.log("[!] Did not get a valid response from API!");
            }
        }
    );   
}

start();
