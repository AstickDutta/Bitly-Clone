const mongoose = require("mongoose")

const isValid = (value) => {
    if (typeof value == undefined || value == null || value.length == 0)
        return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};

const isValidBody = (data) => {
    return Object.keys(data).length > 0;
};

module.exports = { isValid, isValidBody }
