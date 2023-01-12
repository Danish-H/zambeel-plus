const ID_OTHER = "DERIVED_LAM_EXPLANATION$";
const ID_OVERALL  = "DERIVED_LAM_LAM_SPECIAL_CHAR$17$";

orig_callback_end_win0 = disableInteractionDuringProcessing;
arrayAvg = [];
overall = document.getElementById(ID_OVERALL).innerHTML;

for (i=0; document.getElementById(ID_OTHER + i) != null; i++) {
    arrayAvg.push(document.getElementById(ID_OTHER + i).innerHTML);
}

disableInteractionDuringProcessing = function (form, id, event, sAjaxTrfUrl, bWarning, sScriptAfter, nTrfURLType) {
    orig_callback_end_win0(form, id, event, sAjaxTrfUrl, bWarning, sScriptAfter, nTrfURLType);

    document.getElementById(ID_OVERALL).innerHTML = overall;

    for (i=0; document.getElementById(ID_OTHER + i) != null; i++) {
        document.getElementById(ID_OTHER + i).innerHTML = arrayAvg[i];
    }
}
