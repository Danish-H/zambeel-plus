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

function printMeans(meanArr) {
    for (i=0; i<meanArr.length; i++) {
        marksDoc.getElementById("DERIVED_LAM_EXPLANATION$"+ i).innerHTML += meanArr[i];
    }
}

console.log("[!] Zambeel+ is running");

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

// Parse Class Assignments table
document.onreadystatechange = function () {
    console.log("Frame state changed!");
    if (document.readyState == "complete") {
        for (i=0; marksDoc.getElementById(ID_MARK + i) != null; i++) {
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

    // JSON data for POST
    let jsondata = JSON.stringify({
        user: urlParams.EMPLID[0],
        term: urlParams.STRM[0],
        class: urlParams.CLASS_NBR[0],
        marks: marksArr
    });

    chrome.runtime.sendMessage(
        jsondata,
        data => printMeans(JSON.parse(data).means)
    );
}