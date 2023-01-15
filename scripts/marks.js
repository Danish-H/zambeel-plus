function monkeyPatch() {
    var script = document.createElement('script');
    script.setAttribute("language", "JavaScript");
    script.src = chrome.runtime.getURL("scripts/monkey.js");
    document.head.appendChild(script);
}

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
        document.getElementById("DERIVED_LAM_EXPLANATION$"+ i).innerHTML += meansArr[i];
    }
    document.getElementById("DERIVED_LAM_LAM_SPECIAL_CHAR$17$").innerHTML += response.overall_mean;
    monkeyPatch();
}

window.onload = function () {
    // User better tables
    if (localStorage.getItem("zpBetterTables") == "true") {
        document.body.classList.add("better-tables");
    }

    // Return if not marks page
    if (!document.getElementById("win0divSTDNT_GRADE_DTL$0")) {
        return;
    }

    // Parse course information from URL
    urlParams = getURLParams(window.location.search);
    console.log("User: " + urlParams.EMPLID);
    console.log("Term: " + urlParams.STRM);
    console.log("Class: " + urlParams.CLASS_NBR);
    marksArr = [];

    // Element IDs for parsing marks
    const ID_COMP = "ACTIVITY$";
    const ID_CAT = "CATEGORY$";
    const ID_MARK = "STDNT_GRADE_DTL_STUDENT_GRADE$";
    const ID_MAX = "LAM_CLASS_ACTV_MARK_OUT_OF$";
    const ID_OTHER = "DERIVED_LAM_EXPLANATION$";
    const ID_OVERALL  = "STDNT_GRADE_HDR_GRADE_AVG_CURRENT";

    // Parse marks
    for (i=0; document.getElementById(ID_COMP + i) != null; i++) {
        if (document.getElementById(ID_MARK + i) != null) {
            let mark = {
                "component_no": i,
                "component": document.getElementById(ID_COMP + i).innerHTML,
                "mark": document.getElementById(ID_MARK + i).innerHTML,
                "max_mark": document.getElementById(ID_MAX + i).innerHTML
            };
            marksArr.push(mark);
            document.getElementById(ID_OTHER + i).innerHTML += "✔ Read by <b style='color: purple;'><i>Z+</i></b>";
        }
    }

    // Parse overall
    if (document.getElementById(ID_OVERALL).innerHTML != null) {
        marksArr.push({
            "component_no": -1,
            "component": "Overall",
            "mark": document.getElementById(ID_OVERALL).innerHTML,
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

    // Send POST
    chrome.runtime.sendMessage(
        {
            endpoint: "add_mark",
            data: jsondata
        },
        data => {
            try {
                printMeans(JSON.parse(data));
            } catch(err) {
                console.log("[!] Did not get a valid response from API!");
            }
        }
    );
}
