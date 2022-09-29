const mongoose = require("mongoose")
const urlModel = require("../models/urlModel")
const shortid = require("shortid")
const validUrl = require("valid-url")

const createURL = async function (req, res) {
    try {
        let originalURL = req.body.longUrl

        if (validUrl.isUri(originalURL)) {
            const checkUrlInDB = await urlModel.findOne({ longUrl: originalURL })

            if (checkUrlInDB) {
                return res.status(200).send({ status: false, message: "URL is already present please use another URL " })
            }
            else {

                let baseURL = "http://localhost:3000"
                const urlCode = shortid.generate()
                const shortUrl = baseURL + "/" + urlCode

                let obj = {}
                obj.longUrl = originalURL
                obj.shortUrl = shortUrl
                obj.urlCode = urlCode

                const createURL = await urlModel.create(obj)
                return res.status(201).send({ status: true, message: "Short URL generate successfully", data: createURL })
            }

        }
        else {
            return res.status(401).send({ status: false, message: "Invalid Long URL" })
        }
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


let getUrl = async function (req, res) {
    try {
        urlCode = req.params.urlCode

        //validation for urlCode

        getLongUrl = await urlModel.findOne({ urlCode: urlCode }).select({ _id: 0, longUrl: 1 })

        if (!getLongUrl) return res.status(404).send({ status: false, msg: "no match found" })
        return res.status(200).send({ status: true, data: getLongUrl })
    }
    catch (err) {
        return res.status(500).send({ data: err.message })
    }

}

module.exports.createURL = createURL
module.exports.getUrl = getUrl