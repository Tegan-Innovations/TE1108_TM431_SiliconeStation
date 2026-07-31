// Keep this line for a best effort IntelliSense in the editor.
/// <reference path="./../../../Packages/Beckhoff.TwinCAT.HMI.Framework.14.3.431/runtimes/native1.12-tchmi/TcHmi.d.ts" />

(function () {
    'use strict';

    // ============================================================
    // PLC SYMBOL
    // ============================================================

    const MANUAL_MODE_REQUEST_SYMBOL =
        '%s%ADS.PLC1.GVL_HMI.stCommands.bManualModeRequest%/s%';

    // ============================================================
    // HMI CONTROLS AND PAGE
    // ============================================================

    const MAIN_POPUP_ID = 'Main_Popup';
    const MAIN_REGION_ID = 'Main_Region';

    const MANUAL_MODE_PAGE =
        'Contents/Screens/Manual_Mode.content';

    // ============================================================
    // CLOSE POPUP
    // ============================================================

    window.closeMainPopup = function () {
        const popup =
            TcHmi.Controls.get(MAIN_POPUP_ID);

        if (popup) {
            popup.close();
        }
    };

    // ============================================================
    // OPEN MANUAL MODE PAGE
    // ============================================================

    window.goToManualModePage = function () {
        const mainRegion =
            TcHmi.Controls.get(MAIN_REGION_ID);

        if (mainRegion) {
            mainRegion.setTargetContent(
                MANUAL_MODE_PAGE
            );
        }
    };

    // ============================================================
    // CONFIRM MANUAL MODE
    // ============================================================

    window.confirmManualMode = function () {

        TcHmi.Symbol.writeEx2(
            MANUAL_MODE_REQUEST_SYMBOL,
            true,
            function (dataWrite) {

                if (
                    dataWrite.error !==
                    TcHmi.Errors.NONE
                ) {
                    alert(
                        'Failed to request Manual Mode. Error: ' +
                        dataWrite.error
                    );

                    return;
                }

                window.closeMainPopup();
                window.goToManualModePage();
            }
        );
    };

    // ============================================================
    // CANCEL MANUAL MODE
    // ============================================================

    window.cancelManualMode = function () {
        window.closeMainPopup();
    };

})();