function getURLParams(url) {
    var qStart = url.indexOf("?") + 1;
    var qEnd = url.indexOf("#") + 1 || url.length + 1;

    var query = url.slice(qStart, qEnd - 1);
    var pairs = query.replace(/\+/g, " ").split("&");

    var parms = {}, i, n, v, nv;

    if (query === url || query === "") return;

    for (i=0; i<pairs.length; i++) {
        nv = pairs[i].split("=", 2);
        n = decodeURIComponent(nv[0]);
        v = decodeURIComponent(nv[1]);

        if (!parms.hasOwnProperty(n)) parms[n] = [];
        parms[n].push(nv.length === 2 ? v : null);
    }

    return parms;
}

function printMeans(response) {
    meansArr = response.means;
    for (i=0; i<meansArr.length; i++) {
        marksDoc.getElementById("DERIVED_LAM_EXPLANATION$"+ i).innerHTML += meansArr[i];
    }
    marksDoc.getElementById("DERIVED_LAM_LAM_SPECIAL_CHAR$17$").innerHTML += response.overall_mean;
}

console.log("[!] Zambeel+ is running");

// Update theme
if (localStorage.getItem("zpDarkMode") == "on") {
    document.body.classList.add("dark");
}

// Add theme change button
zpDmSw = document.createElement("div");
zpDmSw.classList.add("ps_box-button", "psc_image_only", "psc_toolaction-home", "ps_header_button", "psc_hide-BP2");
zpDmSw.innerHTML =
`<span class="ps-button-wrapper" title="Home">
<a id="PT_HOME" class="ps-button" role="button" href="#" id="dark-mode-btn">
<img style="filter: invert(1);" src="https://www.svgrepo.com/show/472736/moon.svg" class="ps-img" alt="Home">
</a>
</span>`
document.getElementById("win0hdrdivPTLAYOUT_HEADER_GROUPBOX6").prepend(zpDmSw);

// Change theme on click
zpDmSw.onclick = () => {
    if (document.body.classList.contains("dark")) {
        document.body.classList.add("animated");
        document.body.classList.remove("dark");
        localStorage.setItem("zpDarkMode", "off");
    } else {
        document.body.classList.add("animated");
        document.body.classList.add("dark");
        localStorage.setItem("zpDarkMode", "on");
    }
}

// Parse course information from URL
urlParams = getURLParams(window.location.search);
console.log("User: " + urlParams.EMPLID);
console.log("Term: " + urlParams.STRM);
console.log("Class: " + urlParams.CLASS_NBR);

// Select iframe with assignment marks
var marksFrame = document.getElementById("ptifrmtgtframe");
var marksDoc = marksFrame.contentWindow.document;
var marksArr = [];

// Element IDs for parsing marks
const ID_COMP = "ACTIVITY$";   
const ID_CAT = "CATEGORY$";   
const ID_MARK = "STDNT_GRADE_DTL_STUDENT_GRADE$";
const ID_MAX = "LAM_CLASS_ACTV_MARK_OUT_OF$";
const ID_OTHER = "DERIVED_LAM_EXPLANATION$"
const ID_OVERALL  = "STDNT_GRADE_HDR_GRADE_AVG_CURRENT";

// Parse Class Assignments table
document.onreadystatechange = function () {
    console.log("Frame state changed!");
    if (document.readyState == "complete") {
        for (i=0; marksDoc.getElementById(ID_COMP + i) != null; i++) {
            if (marksDoc.getElementById(ID_MARK + i) != null) {
                let mark = {
                    "component_no": i,
                    "component": marksDoc.getElementById(ID_COMP + i).innerHTML,
                    "mark": marksDoc.getElementById(ID_MARK + i).innerHTML,
                    "max_mark": marksDoc.getElementById(ID_MAX + i).innerHTML
                };
                marksArr.push(mark);
                marksDoc.getElementById(ID_OTHER + i).innerHTML += "✔ Read by <b style='color: purple;'><i>Z+</i></b>";
            }
        }

        if (marksDoc.getElementById(ID_OVERALL).innerHTML != null) {
            marksArr.push({
                "component_no": -1,
                "component": "Overall",
                "mark": marksDoc.getElementById(ID_OVERALL).innerHTML,
                "max_mark": "100.00"
            });
        }

        // JSON data for POST
        let jsondata = JSON.stringify({
            user: urlParams.EMPLID[0],
            term: urlParams.STRM[0],
            class: urlParams.CLASS_NBR[0],
            marks: marksArr
        });
    
        chrome.runtime.sendMessage(
            jsondata,
            data => {
                try {
                    printMeans(JSON.parse(data))
                } catch(err) {
                    console.log("[!] Did not get a valid response from API!")
                }
            }
        );
    }
}