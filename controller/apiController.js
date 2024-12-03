require("dotenv").config();
const db = require("../postgresql.js");

const getAllUserData = () => {
    return new Promise(async (resolve, reject) => {
        try {
            db.SELECT("*", `accounts`, "true", (result) => {
                resolve({ status: true, data: result.rows });
            });
        } catch (error) {
            resolve({ status: false, message: error });
        }
    });
};
const createUser = ({ name, balance, email, password }) => {
    return new Promise(async (resolve, reject) => {
        try {
            db.SELECT(
                "*",
                `add_account_json(
                '${balance}', 
                '${name}',
                '${email}',
                '${password}')`,
                "",
                (result) => {
                    const resultData = result.rows[0].add_account_json
                    if (resultData.status === 200) {
                        resolve({
                            status: resultData.status,
                            data: resultData
                        });
                    } else if (resultData.status === 400) {
                        resolve({
                            status: resultData.status,
                            error: resultData.error
                        });
                    }
                })
        } catch (error) {
            resolve({ status: false, message: error });
        }
    })
}
const deleteUser = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            db.SELECT(
                "*",
                `delete_account('${id}')`,
                "",
                (result) => {
                    const resultData = result.rows[0].delete_account
                    if (resultData.status === 200) {
                        resolve({ data: resultData });
                    } else if (resultData.status === 404) {
                        resolve({
                            status: resultData.status,
                            error: resultData.error
                        });
                    }
                }
            )
        } catch (error) {
            resolve({ status: false, message: error });
        }
    })
}
const getDetailUser = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            db.SELECT(
                "*",
                `get_detail_account('${id}')`,
                "",
                (result) => {
                    const resultData = result.rows[0].get_detail_account
                    if (resultData.status === 200) {
                        resolve({ data: resultData });
                    } else if (resultData.status === 404) {
                        resolve({
                            status: resultData.status,
                            error: resultData.error
                        });
                    }
                }
            )
        } catch (error) {
            resolve({ status: false, message: error });
        }
    })
}
const updateUser = ({ id, name, balance, email,password }) => {
    return new Promise(async (resolve, reject) => {
        try {
            db.SELECT(
                "*",
                `update_account(
                '${id}',
                '${name}', 
                '${balance}',
                '${email}',
                '${password}')`,
                "",
                (result) => {
                    const resultData = result.rows[0].update_account
                    if (resultData.status === 200) {
                        resolve({
                            status: resultData.status,
                            data: resultData
                        });
                    } else if (resultData.status === 404 || resultData.status === 405) {
                        resolve({
                            status: resultData.status,
                            error: resultData.error
                        });
                    }
                })
        } catch (error) {
            resolve({ status: false, message: error });
        }
    })
}
const importUserFromExcel = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const jsonData = JSON.stringify(data);
            db.SELECT(
                "*",
                `import_user_data('${jsonData}')`,
                "",
                (result) => {
                    const resultData = result.rows[0].import_user_data
                    if (resultData.status === 200) {
                        resolve({ data: resultData });
                    } else if (resultData.status === 404) {
                        resolve({
                            status: resultData.status,
                            error: resultData.message
                        });
                    }
                }
            )
        } catch (error) {
            resolve({ status: false, message: error });
        }
    })
}
module.exports = {
    getAllUserData,
    createUser,
    deleteUser,
    getDetailUser,
    updateUser,
    importUserFromExcel
};