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

function parseGrades() {
    const ID_GRADE = "STDNT_ENRL_SSV1_CRSE_GRADE_OFF$";
    const ID_COURSE = "CLS_LINK$";
    const ID_DESC = "CLASS_TBL_VW_DESCR$";
    const ID_UNITS = "STDNT_ENRL_SSV1_UNT_TAKEN$";
    const ID_OTHER = "GRADING_BASIS$"
    const ID_SEM = "DERIVED_REGFRM1_SSR_STDNTKEY_DESCR$11$";

    const GPA = {
        "A+": 4.0, "A": 4.0, "A-": 3.7,
        "B+": 3.3, "B": 3.0, "B-": 2.7,
        "C+": 2.3, "C": 2.0, "C-": 1.7,
        "D+": 1.3, "D": 1.0, "D-": 0.7,
        "F": 0
    }

    var gradesArr = [];

    // Parse grades
    for (i=0; document.getElementById(ID_GRADE + i) != null; i++) {
        if (document.getElementById(ID_GRADE + i).innerHTML != "&nbsp;") {
            let grade = {
                "course": document.getElementById(ID_COURSE + i).innerHTML,
                "desc": document.getElementById(ID_DESC + i).innerHTML,
                "units": document.getElementById(ID_UNITS + i).innerHTML,
                "grade": document.getElementById(ID_GRADE + i).innerHTML
            };

            gradesArr.push(grade);
            document.getElementById(ID_OTHER + i).innerHTML += "&nbsp;&nbsp;&nbsp;✔ <b style='color: purple;'><i>Z+</i></b>";
                
            // Calculate colour based on absolute grade
            perf = GPA[document.getElementById(ID_GRADE + i).innerHTML]/4.0;
            hue = ((perf-0.4)*(120*(1/0.6)));
            if (hue < 0) { hue = 0; }

            // Invert if dark mode is on
            if (localStorage.getItem("zpDarkMode") == "true") { hue += 180; }

            // Show colour
            document.getElementById(ID_GRADE + i).parentNode.parentNode.style.borderRight = "10px solid hsl("+hue+", 60%, 50%)";
        }
    }

    if (gradesArr.length == 0) { return; }

    // JSON data for POST
    let jsondata = JSON.stringify({
        "sem": document.getElementById(ID_SEM).innerHTML.split(" | ")[0],
        grades: gradesArr
    });

    console.log(jsondata);

    // Send POST
    chrome.runtime.sendMessage(
        {
            endpoint: "add_grade",
            data: jsondata
        },
        data => {
            try {
                console.log(data);
            } catch(err) {
                console.log("[!] Did not get a valid response from API!");
            }
        }
    );
}

function autoEnrollSecondStep() {
    const ID_BUTTON_SECONDSTEP = "DERIVED_REGFRM1_SSR_PB_SUBMIT";
    const btnSecondStep = document.getElementById(ID_BUTTON_SECONDSTEP);
    if (btnSecondStep.getAttribute("value") == "Finish Enrolling") {
        btnSecondStep.click();
    }
}

chrome.webRequest.onCompleted.addListener(
    function(details) {
        chrome.scripting.executeScript({
            target: { tabId: details.tabId, allFrames : true},
            func: parseGrades
        });
    },
    {urls: ["https://zambeel.lums.edu.pk/psc/ps/EMPLOYEE/SA/c/SA_LEARNER_SERVICES.SSR_SSENRL_GRADE.GBL*"]}
);

chrome.webRequest.onCompleted.addListener(
    function(details) {
        chrome.scripting.executeScript({
            target: { tabId: details.tabId, allFrames : true},
            func: autoEnrollSecondStep
        });
    },
    {urls: ["https://zambeel.lums.edu.pk/psc/ps/EMPLOYEE/SA/c/SA_LEARNER_SERVICES.SSR_SSENRL_ADD.GBL*"]}
)
