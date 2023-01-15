function updateTheme() {
    if (localStorage.getItem("zpDarkMode") == "true") {
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark");
    }
}

function updateTables() {
    bodies = [document.body];
    
    // Update tables if inside these specific iframes
    if (document.getElementById("main_target_win0")) { bodies.push(document.getElementById("main_target_win0").contentWindow.document.body) }
    if (document.getElementById("ptifrmtgtframe"))   { bodies.push(document.getElementById("ptifrmtgtframe").contentWindow.document.body)   }

    for (let i=0; i<bodies.length; i++) {
        if (bodies[i]) {
            if (localStorage.getItem("zpBetterTables") == "true") { bodies[i].classList.add("better-tables") }
            else { bodies[i].classList.remove("better-tables") }
        }
    }
}

function addBtnDark() {
    // Attempt to add dark mode button in most pages where possible
    if (document.getElementById("win0hdrdivPTLAYOUT_HEADER_GROUPBOX6")) {
        document.getElementById("win0hdrdivPTLAYOUT_HEADER_GROUPBOX6").prepend(btnDark);
    } else if (document.querySelector(".ps_header_bar .ps_actions_cont .ps_system_cont")) {
               document.querySelector(".ps_header_bar .ps_actions_cont .ps_system_cont").prepend(btnDark);
    } else if (document.getElementById("win354hdrdivPT_ACTION_CONT")) {
               document.getElementById("win354hdrdivPT_ACTION_CONT").prepend(btnDark);
    } else { console.log("[!] Could not add dark mode button!"); }
}

function setAccent(colors) {
    // Changes the color of the thin accent at the very top of the page
    var style = document.createElement('style');
    style.textContent = 
`:root:not(.psc_mode-hc) body .ps_header_bar-container:before,
body #ptbr_header_container:before
{ background: linear-gradient(to right, `+colors[0]+` 0%, `+colors[1]+` 100%) !important; }`;
    document.head.appendChild(style);
}

function parseClassInfo(doc, timingId, classId) {
    classDay   = doc.getElementById(timingId).innerHTML.split(" ")[0];
    classTimeA = doc.getElementById(timingId).innerHTML.split(" - ")[0].replace("AM", "").replace(":", "").split(" ")[1];
    classTimeB = doc.getElementById(timingId).innerHTML.split(" - ")[1].replace("AM", "").replace(":", "");

    if (classTimeA.includes("PM")) {
        classTimeA = classTimeA.replace("PM", "");
        if (!classTimeA.startsWith("12")) { classTimeA = parseInt(classTimeA) + 1200; }
    }
    if (classTimeB.includes("PM")) {
        classTimeB = classTimeB.replace("PM", "");
        if (!classTimeB.startsWith("12")) { classTimeB = parseInt(classTimeB) + 1200; }
    }

    if (classId) {
        className  = doc.getElementById(classId).innerHTML.replace("(", "").replace(")", "").split("<br>\n ");
        return {
            name: className[0],
            number: className[1],
            days: classDay,
            timeStart: classTimeA,
            timeEnd: classTimeB
        }
    } else {
        return {
            days: classDay,
            timeStart: classTimeA,
            timeEnd: classTimeB
        }
    }
}

function createSchedPrev(doc) {
    canvas = doc.createElement("canvas");
    canvas.style.boxShadow = "inset 0 0 10px #eee";
    canvas.style.overflow = "hidden";
    canvas.style.display = "block";
    canvas.style.backgroundColor = "#fff";
    if (document.body.classList.contains("dark")) { canvas.style.filter = "invert(1)"; }
            
    ctx = canvas.getContext("2d");
    ctx.canvas.width  = 120;
    ctx.canvas.height = 150;
    ctx.globalAlpha = 0.8;

    return [canvas, ctx];
}

function drawClass(ctx, d, sT, eT, fill="#555", border) {
    ctx.fillStyle = fill;

    // Calculate relative dimensions of cells
    sT = sT/10 - 70;
    eT = eT/10 - 70;
    w = 20;

    // Draw cells
    if (d.includes("Mo")) { ctx.fillRect(0,   sT, w, eT-sT); }
    if (d.includes("Tu")) { ctx.fillRect(w,   sT, w, eT-sT); }
    if (d.includes("We")) { ctx.fillRect(w*2, sT, w, eT-sT); }
    if (d.includes("Th")) { ctx.fillRect(w*3, sT, w, eT-sT); }
    if (d.includes("Fr")) { ctx.fillRect(w*4, sT, w, eT-sT); }
    if (!border) { return; }

    // Draw stroke
    ctx.strokeStyle = border;
    if (d.includes("Mo")) { ctx.strokeRect(0,   sT, w, eT-sT); }
    if (d.includes("Tu")) { ctx.strokeRect(w,   sT, w, eT-sT); }
    if (d.includes("We")) { ctx.strokeRect(w*2, sT, w, eT-sT); }
    if (d.includes("Th")) { ctx.strokeRect(w*3, sT, w, eT-sT); }
    if (d.includes("Fr")) { ctx.strokeRect(w*4, sT, w, eT-sT); }
}



console.log("[!] Zambeel+ is running");

// Update theme
updateTheme();
updateTables();



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



// Create Zambeel+ menu
menu = document.createElement("ul");
menu.classList.add("zpMenu");
menu.innerHTML = `<li><a>Zambeel+ v`+chrome.runtime.getManifest().version+`</a></li>`;

// Create tables button
btnTables = document.createElement("li");
btnTables.innerHTML = `<a href="#">Better Tables: Off</a>`;
if (document.body.classList.contains("better-tables")) {
    btnTables.innerHTML = `<a href="#">Better Tables: On</a>`;
}
menu.appendChild(btnTables);

// Create dark mode button for menu
btnDark2 = document.createElement("li");
btnDark2.innerHTML = `<a href="#" style="padding: 5px">&#127766;</a>`;
if (document.body.classList.contains("dark")) {
    btnDark2.innerHTML = `<a href="#" style="padding: 5px">&#127761;</a>`;
}
menu.appendChild(btnDark2);

// Create read button
btnRead = document.createElement("li");
btnRead.innerHTML = `<a href="#" style="padding: 5px">&#128269;</a>`;
menu.appendChild(btnRead);

// Add buttons to menu
document.body.appendChild(menu);

// Change button and tables on click
btnTables.onclick = () => {
    localStorage.setItem("zpBetterTables", !document.body.classList.contains("better-tables"));
    updateTables();
    if (document.body.classList.contains("better-tables")) {
        btnTables.innerHTML = `<a href="#">Better Tables: On</a>`;
    } else {
        btnTables.innerHTML = `<a href="#">Better Tables: Off</a>`;
    }
}

// Change theme on click
btnDark2.onclick = () => {
    document.body.classList.add("animated");
    localStorage.setItem("zpDarkMode", !document.body.classList.contains("dark"));
    updateTheme();
    if (document.body.classList.contains("dark")) {
        btnDark2.innerHTML = `<a href="#" style="padding: 5px">&#127761;</a>`;
    } else {
        btnDark2.innerHTML = `<a href="#" style="padding: 5px">&#127766;</a>`;
    }
}

// To track previews so they can be removed easily
var canva = false;
var canvases = [];

// Read page on click
btnRead.onclick = () => {
    if (canvases[0]) {
        for (i=0; i<canvases.length; i++) { canvases[i].remove(); }
        return canvases = [];
    }

    var frame = document.getElementById("main_target_win0");
    var doc = frame.contentWindow.document;
    var regClasses = []

    const ID_STATUS = "win0divDERIVED_REGFRM1_SSR_STATUS_LONG$185$$";
    const ID_DATE = "DERIVED_REGFRM1_SSR_MTG_SCHED_LONG$160$$";
    const ID_DATE2 = "DERIVED_REGFRM1_SSR_MTG_SCHED_LONG$";
    const ID_CLASS = "E_CLASS_NAME$";

    if (doc.getElementById(ID_STATUS+"0")) {
        
        // Parse days and timings of all enrolled classes
        for (i=0; doc.getElementById(ID_STATUS+i) != null; i++) {
            if ( doc.getElementById(ID_STATUS+i).innerHTML.includes("SUCCESS")) {
                regClasses.push(parseClassInfo(doc, ID_DATE+i, ID_CLASS+i));
            }
        }

        // Create preview for each class listed (enrolled, dropped, waitlisted)
        for (i=0; doc.getElementById(ID_STATUS + i) != null; i++) {
            curClass = parseClassInfo(doc, ID_DATE+i);

            [canvas, ctx] = createSchedPrev(doc);

            // Draw all enrolled classes
            for (j=0; j<regClasses.length; j++) {
                drawClass(ctx, regClasses[j].days, regClasses[j].timeStart, regClasses[j].timeEnd); 
            }
            
            // Draw current class
            drawClass(ctx, curClass.days, curClass.timeStart, curClass.timeEnd, "#000");

            canvases.push(canvas);
            doc.getElementById("win0divE_CLASS_NAME$" + i).prepend(canvas);
        }
    }

    // Save registered classes information in local storage
    localStorage.setItem("regClasses", JSON.stringify({
        student: roll,
        classes: regClasses
    }));

    // Create preview for each class in shopping cart
    for (i=0; doc.getElementById(ID_DATE2+i); i++) {
        [canvas, ctx] = createSchedPrev(doc);

        curClass = parseClassInfo(doc, ID_DATE2+i);
        clash = false;

        // Draw all registered courses
        for (j=0; j<regClasses.length; j++) {
            if ((regClasses[j].days == curClass.days) &&
               ((regClasses[j].timeStart <= curClass.timeStart && curClass.timeStart <= regClasses[j].timeEnd) ||
               ((regClasses[j].timeStart <= curClass.timeEnd   && curClass.timeEnd   <= regClasses[j].timeEnd)))) {
                // If class timings clash with registered

                drawClass(ctx, regClasses[j].days, regClasses[j].timeStart, regClasses[j].timeEnd, "#400", "#000");

                canvas.style.boxShadow = "rgb(173 100 100) 0px 0px 10px inset";
                ctx.font = "15px Arial";
                ctx.fillStyle = "#500";

                if (!clash) {
                    ctx.fillText("Clash! 💀", 5, 140);
                    clash = true;
                }
            } else {
                // If no clash
                drawClass(ctx, regClasses[j].days, regClasses[j].timeStart, regClasses[j].timeEnd);
            }   
        }

        // Draw class from shopping cart
        if (clash) { drawClass(ctx, curClass.days, curClass.timeStart, curClass.timeEnd, "#d00", "#000");
        } else {     drawClass(ctx, curClass.days, curClass.timeStart, curClass.timeEnd, "#040"); }
        

        // Show preview in shopping cart
        doc.getElementById("win0divP_CLASS_NAME$" + i).prepend(canvas);
        canvases.push(canvas);
    }
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

// Get color
if (roll != "") {
    chrome.runtime.sendMessage(
        {
            endpoint: "get_colors",
            data: JSON.stringify({ roll_no: roll })
        },
        data => {
            try {
                setAccent(JSON.parse(data).colors);
            } catch(err) {
                console.log("[!] Did not get a valid response from API!");
            }
        }
    );
}
