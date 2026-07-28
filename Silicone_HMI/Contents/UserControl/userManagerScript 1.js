// Keep these lines for best-effort IntelliSense support in Visual Studio 2017 and later.
/// <reference path="./../../../Packages/Beckhoff.TwinCAT.HMI.Framework.14.3.431/runtimes/native1.12-tchmi/TcHmi.d.ts" />

// sysManag.js

async function userManager(User, Password, Group, slctUser, Action) {
    try {
        const userData = User;
        const passwordData = Password;
        const groupData = Number(Group);
        const act = Action;
        const oldUser = slctUser;

        let groupName = '';
        let logoutTime = '';

        if (groupData === 1) {
        groupName = 'Administrator';
        logoutTime = 'PT15M';
        }

        if (groupData === 2) {
            groupName = 'Engineer';
            logoutTime = 'PT15M';
        }

        if (groupData === 3) {
            groupName = 'Operator';
            logoutTime = 'P30D';
        }

        console.log('Group received:', Group);
        console.log('Group converted:', groupData);
        console.log('Group name:', groupName);

        // ========================================================
        // CURRENT STEP: DUPLICATE VALIDATION FOR ADD USER ONLY
        // ========================================================
        if (act === 'addUser') {
            // Prevent user creation when required fields are empty.
            if (!userData || !passwordData || !groupName) {
                alert(
                    'Validation Notice: Please enter a username and password, and select a group.'
                );
                return;
            }
        }

        if (act === 'addUser') {
            // Read the user list exposed by the server through the ListUsers symbol.
            TcHmi.Symbol.readEx2(
                '%s%TcHmiUserManagement.ListUsers%/s%',
                function (data) {
                    if (data.error === TcHmi.Errors.NONE) {
                        /*
                         * data.result contains an array with the existing
                         * usernames, for example:
                         *
                         * ["__SystemAdministrator", "User01"]
                         */
                        const userListArray = data.result;

                        if (Array.isArray(userListArray)) {
                            // Check whether the entered username already exists.
                            if (userListArray.includes(userData)) {
                                alert(
                                    "Validation Error: The username '" +
                                        userData +
                                        "' already exists in the system."
                                );
                                return;
                            }
                        }
                    } else {
                        alert(
                            'Server Error: Failed to retrieve the user list. Code: ' +
                                data.error
                        );
                        return;
                    }

                    // Create the user after all validations have passed.
                    TcHmi.Server.UserManagement.addUserEx(
                        userData,
                        passwordData,
                        {
                            groups: [groupName],
                            enabled: true,
                            locale: 'en',
                            autoLogout: logoutTime
                        },
                        {
                            timeout: 2000
                        },
                        function (dataAdd) {
                            if (dataAdd.error === TcHmi.Errors.NONE) {
                                alert('User created successfully.');
                            } else {
                                alert(
                                    'Server Error: Failed to create the new user. Code: ' +
                                        dataAdd.error
                                );
                            }
                        }
                    );
                }
            );

            console.log(act);
        }

        if (act === 'removeUser') {
            TcHmi.Server.UserManagement.removeUserEx(
                userData,
                null,
                {
                    timeout: 2000
                },
                function (data) {
                    if (data.error === TcHmi.Errors.NONE) {
                        alert('User removed successfully.');
                    } else {
                        alert(
                            'Server Error: Failed to remove the selected user. Code: ' +
                                data.error
                        );
                    }
                }
            );
        }

        if (act === 'changeName') {
            TcHmi.Server.UserManagement.updateUser(
                oldUser,
                {
                    newName: userData
                },
                function (data) {
                    if (data.error === TcHmi.Errors.NONE) {
                        alert('User renamed successfully.');
                    } else {
                        alert(
                            'Server Error: Failed to rename the selected user. Code: ' +
                                data.error
                        );
                    }
                }
            );
        }

        if (act === 'addGroup') {
            TcHmi.Server.UserManagement.updateUser(
                oldUser,
                {
                    addGroups: [groupName]
                },
                function (data) {
                    if (data.error === TcHmi.Errors.NONE) {
                        alert('Group assigned successfully.');
                    } else {
                        alert(
                            'Server Error: Failed to assign the group to the user. Code: ' +
                                data.error
                        );
                    }
                }
            );
        }

        if (act === 'removeGroup') {
            TcHmi.Server.UserManagement.updateUser(
                oldUser,
                {
                    removeGroups: [groupName]
                },
                function (data) {
                    if (data.error === TcHmi.Errors.NONE) {
                        alert('Group removed successfully.');
                    } else {
                        alert(
                            'Server Error: Failed to remove the group from the user. Code: ' +
                                data.error
                        );
                    }
                }
            );
        }

        if (act === 'changePassword') {
            TcHmi.Server.UserManagement.updateUser(
                oldUser,
                {
                    password: passwordData
                },
                function (data) {
                    if (data.error === TcHmi.Errors.NONE) {
                        alert('Password updated successfully.');
                    } else {
                        alert(
                            'Server Error: Failed to update the password. Code: ' +
                                data.error
                        );
                    }
                }
            );
        }

        console.log(userData);
        console.log(passwordData);
        console.log(groupData);
    } catch (error) {
        alert('Fatal Application Error: ' + error.message);
    }
}