const ID_OTHER = "DERIVED_LAM_EXPLANATION$";
const ID_OVERALL  = "DERIVED_LAM_LAM_SPECIAL_CHAR$17$";
const ID_MARK = "STDNT_GRADE_DTL_STUDENT_GRADE$";

arrayAvg = [];
colors = []

// Save old data
overall = document.getElementById(ID_OVERALL).innerHTML;
cutoffsTable = document.getElementById("zp_cutoffs_table");

for (i=0; document.getElementById(ID_OTHER + i) != null; i++) {
    arrayAvg.push(document.getElementById(ID_OTHER + i).innerHTML);
    colors.push(document.getElementById(ID_MARK + i).parentNode.parentNode.style.borderLeft);
}

// Monkey patch
orig_callback_end_win0 = disableInteractionDuringProcessing;

disableInteractionDuringProcessing = function (form, id, event, sAjaxTrfUrl, bWarning, sScriptAfter, nTrfURLType) {
    orig_callback_end_win0(form, id, event, sAjaxTrfUrl, bWarning, sScriptAfter, nTrfURLType);

    // Restore old data
    document.getElementById(ID_OVERALL).innerHTML = overall;
    document.getElementById("win0divSTDNT_GRADE_HDR_GRADE_AVG_CURRENTlbl").parentNode.parentNode.parentNode.parentNode.parentNode.append(cutoffsTable);

    for (i=0; document.getElementById(ID_OTHER + i) != null; i++) {
        document.getElementById(ID_OTHER + i).innerHTML = arrayAvg[i];
        document.getElementById(ID_MARK + i).parentNode.parentNode.style.borderLeft = colors[i];
    }
}
