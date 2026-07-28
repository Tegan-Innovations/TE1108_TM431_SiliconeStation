// Keep these lines for a best effort IntelliSense of Visual Studio 2017 and higher.
/// <reference path="./../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.762.46/runtimes/native1.12-tchmi/TcHmi.d.ts" />

(function (/** @type {globalThis.TcHmi} */ TcHmi) {
    var Functions;

    (function (/** @type {globalThis.TcHmi.Functions} */ Functions) {
        var TcHmiProject1;

        (function (TcHmiProject1) {

            function RowClassesProvider(RowData, RowIndex, RowNumber) {
                var cssStyles = [];

                if (!RowData) {
                    return cssStyles;
                }

                /*
                 * GVL_Persistent.astEventsHistory:
                 *
                 * abType = 1 -> Fault / Alarm
                 * abType = 2 -> Alert
                 * abType = 3 -> Message
                 */
                var typeNumber = Number(RowData.abType);

                switch (typeNumber) {
                    case 1:
                        cssStyles.push("Alarm");
                        break;

                    case 2:
                        cssStyles.push("Alert");
                        break;

                    case 3:
                        cssStyles.push("Message");
                        break;
                }

                return cssStyles;
            }

            TcHmiProject1.RowClassesProvider = RowClassesProvider;

        })(TcHmiProject1 =
            Functions.TcHmiProject1 ||
            (Functions.TcHmiProject1 = {}));

    })(Functions =
        TcHmi.Functions ||
        (TcHmi.Functions = {}));

})(TcHmi);

TcHmi.Functions.registerFunctionEx(
    "RowClassesProvider",
    "TcHmi.Functions.TcHmiProject1",
    TcHmi.Functions.TcHmiProject1.RowClassesProvider
);