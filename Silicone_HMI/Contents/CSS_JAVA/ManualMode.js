// Keep these lines for a best effort IntelliSense in the editor.
/// <reference path="./../../../TE1108_Kistler/Packages/Beckhoff.TwinCAT.HMI.Framework.14.3.431/runtimes/native1.12-tchmi/TcHmi.d.ts" />
/// <reference path="./../../../Packages/Beckhoff.TwinCAT.HMI.Framework.14.3.431/runtimes/native1.12-tchmi/TcHmi.d.ts" />

(function () {
    'use strict';

    // ============================================================
    // CONFIGURATION
    // ============================================================

    const MACHINE_STATE_SYMBOL =
        '%s%ADS.PLC1.GVL_MASTER.stMachineStatus.eMachineState%/s%';

    const MANUAL_MODE_REQUEST_SYMBOL =
        '%s%ADS.PLC1.GVL_HMI.i_bHMIManualModeRequest%/s%';

    const MAIN_REGION_ID = 'Main_Region';
    const MAIN_POPUP_ID = 'Main_Popup';

    const MANUAL_MODE_PAGE =
        'Contents/Screens/Manual_Mode.content';

    const MAIN_PAGE =
        'Contents/Screens/Main_Kistler.content';

    const READY_TO_START_STATE = 3;
    const MANUAL_MODE_STATE = 6;

    const MANUAL_ENTRY_TIMEOUT_MS = 5000;
    const MANUAL_ENTRY_CHECK_MS = 200;
    const MANUAL_EXIT_CHECK_MS = 300;

    let manualEntryTimer = null;
    let manualEntryTimeout = null;
    let manualExitMonitor = null;
    let exitReadInProgress = false;


    // ============================================================
    // MACHINE STATE HELPERS
    // ============================================================

    function getMachineStateValue(data) {
        if (!data) {
            return null;
        }

        const rawValue =
            data.value !== undefined
                ? data.value
                : data.result;

        const numericValue = Number(rawValue);

        if (!Number.isNaN(numericValue)) {
            return numericValue;
        }

        const stateText =
            String(rawValue).trim().toUpperCase();

        if (stateText.includes('SYSTEM_READY_TO_START')) {
            return READY_TO_START_STATE;
        }

        if (stateText.includes('MANUAL_MODE')) {
            return MANUAL_MODE_STATE;
        }

        return null;
    }


    function isReadyToStart(machineState) {
        return machineState === READY_TO_START_STATE;
    }


    function isManualMode(machineState) {
        return machineState === MANUAL_MODE_STATE;
    }


    // ============================================================
    // POPUP CONTROL
    // ============================================================

    window.closeMainPopup = function () {
        try {
            const popup =
                TcHmi.Controls.get(MAIN_POPUP_ID);

            if (popup) {
                popup.close();
            } else {
                console.log(
                    MAIN_POPUP_ID + ' control not found.'
                );
            }

        } catch (error) {
            console.log(
                'Failed to close Main_Popup: ' +
                error.message
            );
        }
    };


    // ============================================================
    // PAGE NAVIGATION
    // ============================================================

    function getMainRegion() {
        return TcHmi.Controls.get(MAIN_REGION_ID);
    }


    window.goToManualModePage = function () {
        try {
            const mainRegion = getMainRegion();

            if (mainRegion) {
                mainRegion.setTargetContent(
                    MANUAL_MODE_PAGE
                );
            } else {
                console.log(
                    MAIN_REGION_ID + ' control not found.'
                );
            }

        } catch (error) {
            console.log(
                'Failed to open Manual Mode page: ' +
                error.message
            );
        }
    };


    window.goToMainPage = function () {
        try {
            const mainRegion = getMainRegion();

            if (mainRegion) {
                mainRegion.setTargetContent(
                    MAIN_PAGE
                );
            } else {
                console.log(
                    MAIN_REGION_ID + ' control not found.'
                );
            }

        } catch (error) {
            console.log(
                'Failed to open Main page: ' +
                error.message
            );
        }
    };


    function isManualModePageOpen() {
        try {
            const mainRegion = getMainRegion();

            if (
                !mainRegion ||
                typeof mainRegion.getTargetContent !==
                    'function'
            ) {
                return false;
            }

            const currentPage =
                mainRegion.getTargetContent();

            return currentPage === MANUAL_MODE_PAGE;

        } catch (error) {
            console.log(
                'Failed to read current page: ' +
                error.message
            );

            return false;
        }
    }


    // ============================================================
    // WAIT FOR PLC TO ENTER MANUAL MODE
    // ============================================================

    function stopManualEntryMonitor() {
        if (manualEntryTimer !== null) {
            clearInterval(manualEntryTimer);
            manualEntryTimer = null;
        }

        if (manualEntryTimeout !== null) {
            clearTimeout(manualEntryTimeout);
            manualEntryTimeout = null;
        }
    }


    function waitForManualMode() {
        stopManualEntryMonitor();

        manualEntryTimer = setInterval(
            function () {
                TcHmi.Symbol.readEx2(
                    MACHINE_STATE_SYMBOL,
                    function (dataState) {
                        if (
                            dataState.error !==
                            TcHmi.Errors.NONE
                        ) {
                            console.log(
                                'Failed to verify Manual Mode. Code: ' +
                                dataState.error
                            );

                            return;
                        }

                        const machineState =
                            getMachineStateValue(
                                dataState
                            );

                        if (isManualMode(machineState)) {
                            stopManualEntryMonitor();

                            window.closeMainPopup();
                            window.goToManualModePage();
                        }
                    }
                );
            },
            MANUAL_ENTRY_CHECK_MS
        );

        manualEntryTimeout = setTimeout(
            function () {
                stopManualEntryMonitor();

                window.closeMainPopup();

                alert(
                    'Manual Mode was requested, but the PLC did not enter Manual Mode.'
                );
            },
            MANUAL_ENTRY_TIMEOUT_MS
        );
    }


    // ============================================================
    // MANUAL MODE CONFIRMATION
    // ============================================================

    window.confirmManualMode = function () {
        try {
            TcHmi.Symbol.readEx2(
                MACHINE_STATE_SYMBOL,
                function (dataState) {
                    if (
                        dataState.error !==
                        TcHmi.Errors.NONE
                    ) {
                        window.closeMainPopup();

                        setTimeout(function () {
                            alert(
                                'HMI Error: Failed to read Machine State. Code: ' +
                                dataState.error
                            );
                        }, 100);

                        return;
                    }

                    const machineState =
                        getMachineStateValue(
                            dataState
                        );

                    if (isManualMode(machineState)) {
                        window.closeMainPopup();
                        window.goToManualModePage();

                        return;
                    }

                    if (!isReadyToStart(machineState)) {
                        window.closeMainPopup();

                        setTimeout(function () {
                            alert(
                                'Manual Mode blocked: The system is not in Ready To Start.'
                            );
                        }, 100);

                        return;
                    }

                    TcHmi.Symbol.writeEx2(
                        MANUAL_MODE_REQUEST_SYMBOL,
                        true,
                        function (dataWrite) {
                            if (
                                dataWrite.error !==
                                TcHmi.Errors.NONE
                            ) {
                                window.closeMainPopup();

                                setTimeout(function () {
                                    alert(
                                        'HMI Error: Failed to request Manual Mode. Code: ' +
                                        dataWrite.error
                                    );
                                }, 100);

                                return;
                            }

                            /*
                             * Do not open the page immediately.
                             * Wait until the PLC confirms MANUAL_MODE.
                             */
                            waitForManualMode();
                        }
                    );
                }
            );

        } catch (error) {
            window.closeMainPopup();

            setTimeout(function () {
                alert(
                    'Fatal Application Exception: ' +
                    error.message
                );
            }, 100);
        }
    };


    // ============================================================
    // AUTOMATIC EXIT FROM MANUAL PAGE
    // ============================================================

    function checkManualModeExit() {
        /*
         * Only monitor the PLC while the Manual Mode page
         * is currently displayed.
         */
        if (!isManualModePageOpen()) {
            return;
        }

        if (exitReadInProgress) {
            return;
        }

        exitReadInProgress = true;

        TcHmi.Symbol.readEx2(
            MACHINE_STATE_SYMBOL,
            function (dataState) {
                exitReadInProgress = false;

                if (
                    dataState.error !==
                    TcHmi.Errors.NONE
                ) {
                    console.log(
                        'Failed to monitor Manual Mode. Code: ' +
                        dataState.error
                    );

                    return;
                }

                const machineState =
                    getMachineStateValue(
                        dataState
                    );

                /*
                 * Do not navigate on invalid or unavailable data.
                 */
                if (machineState === null) {
                    return;
                }

                /*
                 * Return to the main page whenever the machine
                 * is no longer in MANUAL_MODE.
                 */
                if (!isManualMode(machineState)) {
                    window.goToMainPage();
                }
            }
        );
    }


    function startManualModeExitMonitor() {
        if (manualExitMonitor !== null) {
            return;
        }

        manualExitMonitor = setInterval(
            checkManualModeExit,
            MANUAL_EXIT_CHECK_MS
        );
    }


    // ============================================================
    // INITIALIZATION
    // ============================================================

    const destroyOnInitialized =
        TcHmi.EventProvider.register(
            'onInitialized',
            function () {
                if (
                    typeof destroyOnInitialized ===
                    'function'
                ) {
                    destroyOnInitialized();
                }

                startManualModeExitMonitor();
            }
        );

})();