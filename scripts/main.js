function updateTheme() {
    if (localStorage.getItem("zpDarkMode") == "true") {
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark");
    }
}

function addBtnDark() {
    if (document.getElementById("win0hdrdivPTLAYOUT_HEADER_GROUPBOX6")) {
        document.getElementById("win0hdrdivPTLAYOUT_HEADER_GROUPBOX6").prepend(btnDark);
    } else if (document.querySelector(".ps_header_bar .ps_actions_cont .ps_system_cont")) {
        document.querySelector(".ps_header_bar .ps_actions_cont .ps_system_cont").prepend(btnDark);
    } else if (document.getElementById("win354hdrdivPT_ACTION_CONT")) {
        document.getElementById("win354hdrdivPT_ACTION_CONT").prepend(btnDark);
    } else {
        console.log("[!] Could not add dark mode button!")
    }
}

function setAccent(colors) {
    var style = document.createElement('style');
    style.textContent = 
`:root:not(.psc_mode-hc) body .ps_header_bar-container:before,
body #ptbr_header_container:before
{ background: linear-gradient(to right, `+colors[0]+` 0%, `+colors[1]+` 100%) !important; }`;
    document.head.appendChild(style);
}


console.log("[!] Zambeel+ is running");

// Update theme
updateTheme();

// Create dark mode button
btnDark = document.createElement("div");
btnDark.classList.add("ps_box-button", "psc_image_only", "psc_toolaction-home", "ps_header_button", "psc_hide-BP2");
btnDark.innerHTML =
`<span class="ps-button-wrapper" title="Dark Mode"><a id="PT_HOME" class="ps-button" role="button" href="#" id="dark-mode-btn">
<img style="filter: invert(1); max-height: 23px;" src="https://www.svgrepo.com/show/472736/moon.svg" class="ps-img" alt="Dark">
</a></span>`;
addBtnDark();

// Change theme on click
btnDark.onclick = () => {
    document.body.classList.add("animated");
    localStorage.setItem("zpDarkMode", !document.body.classList.contains("dark"));
    updateTheme();
}



// Get roll number
var roll = "";
if (document.getElementById("pt_envinfo")) {
    roll = document.getElementById("pt_envinfo").getAttribute("user");
} else if (document.getElementById("ptifrmtgtframe")) {
    var marksFrame = document.getElementById("ptifrmtgtframe");
    var marksDoc = marksFrame.contentWindow.document;
    if (marksDoc.getElementById("pt_envinfo_win0")) {
        roll = marksDoc.getElementById("pt_envinfo_win0").getAttribute("user");
    }
}

if (roll != "") {
    chrome.runtime.sendMessage(
        ["get_colors", JSON.stringify({ roll_no: roll })],
        data => {
            try {
                setAccent(JSON.parse(data).colors);
            } catch(err) {
                console.log("[!] Did not get a valid response from API!");
            }
        }
    );
}
