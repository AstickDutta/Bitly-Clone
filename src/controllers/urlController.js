const mongoose = require("mongoose")
const urlModel = require("../models/urlModel")
const shortid = require("shortid")
const validUrl = require("valid-url")

const createURL = async function (req, res) {
    try {
        if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, data: "Please Enter Required Data" })
        
        let obj = {}
        let longUrl = req.body.longUrl

        if (validUrl.isUri(longUrl)) {
            obj.longUrl = longUrl

            const checkUrlInDB = await urlModel.findOne({ longUrl: longUrl }).select({_id: 0, longUrl: 1, shortUrl:1, urlCode: 1 })
            if (checkUrlInDB) {
                return res.status(200).send({ status: false, message: "URL is already present ", data: checkUrlInDB })
            }
            else {

                let baseURL = "http://localhost:3000/"
                const urlCode = shortid.generate()
                const shortUrl = baseURL + urlCode

                obj.shortUrl = shortUrl
                obj.urlCode = urlCode

                const createURL = await urlModel.create(obj)
                const data = await urlModel.findOne(createURL).select({_id: 0, longUrl: 1, shortUrl:1, urlCode: 1 })
                return res.status(201).send({ status: true, message: "Short URL generate successfully", data: data })
            }

        }
        else {
            return res.status(401).send({ status: false, message: "please enter valid URL" })
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

        getLongUrl = await urlModel.findOne({ urlCode: urlCode })

        if (!getLongUrl) return res.status(404).send({ status: false, msg: "No URL Found" })
        return res.redirect(getLongUrl.longUrl)
    }
    catch (err) {
        return res.status(500).send({ data: err.message })
    }
}

module.exports.createURL = createURL
module.exports.getUrl = getUrl