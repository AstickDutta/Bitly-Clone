const mongoose = require("mongoose")
const urlModel = require("../models/urlModel")
const shortid = require("shortid")
const validUrl = require("valid-url")
const axios = require("axios")
const redis = require("redis")
const { promisify } = require("util")

//Connect to redis
const redisClient = redis.createClient(
  12162,
  "redis-12162.c301.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("leRcJONuMFFEzjngBuRygqzsy2rHIrG9", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


const createURL = async function (req, res) {
  try {
    if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, message: "Please Enter Required Data" })

    let obj = {}
    let longUrl = req.body.longUrl

    if (validUrl.isWebUri(longUrl)) {

      let accessibleLink = false;
      await axios
        .get(longUrl)
        .then((res) => {
          if (res.status == 200 || res.status == 201) {
            accessibleLink = true;
          }
        })
        .catch((error) => {
          accessibleLink = false;
        });

      if (accessibleLink == false) {
        return res.status(400).send({ status: false, message: "longurl is not accessible!!" });
      }

      let cahcedUrlData = await GET_ASYNC(`${longUrl}`);
      if (cahcedUrlData) {
        return res.status(200).send({ status: true, message: " longUrl Already Exists in cache", data: JSON.parse(cahcedUrlData) });
      }

      const checkUrlInDB = await urlModel.findOne({ longUrl: longUrl }).select({_id: 0, longUrl: 1, shortUrl: 1, urlCode: 1})
      if (checkUrlInDB) {
        await SET_ASYNC(`${checkUrlInDB.longUrl}`, JSON.stringify(checkUrlInDB))
        return res.status(200).send({ status: true, message: "URL is already Exists in DB" , data: checkUrlInDB})
      }

      let baseURL = "http://localhost:3000/"
      const urlCode = shortid.generate().toLowerCase()
      const shortUrl = baseURL + urlCode
      obj.longUrl = longUrl
      obj.shortUrl = shortUrl
      obj.urlCode = urlCode

      const createURL = await urlModel.create(obj)
      await SET_ASYNC(`${createURL.longUrl}`, JSON.stringify(createURL))
      const data = await urlModel.findOne(createURL).select({ _id: 0, longUrl: 1, shortUrl: 1, urlCode: 1 })
      return res.status(201).send({ status: true, message: "Short URL generate successfully", data: data })

    }
    else {
      return res.status(400).send({ status: false, message: "please enter valid URL" })
    }
  }
  catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}


let getUrl = async function (req, res) {
  try {
    urlCode = req.params.urlCode

    if (!shortid.isValid(urlCode)) {
      return res.status(400).send({ status: false, message: "Invalid urlCode" });
    }

    let cahcedUrlData = await GET_ASYNC(`${urlCode}`)

    if (cahcedUrlData) {
      let data = JSON.parse(cahcedUrlData)
      res.status(302).redirect(data.longUrl)
    }
    else {
      let urlData = await urlModel.findOne({ urlCode: urlCode })
      if (urlData) {
        await SET_ASYNC(`${urlCode}`, JSON.stringify(urlData))
        return res.status(302).redirect(urlData.longUrl)
      } else {
        return res.status(404).send({ status: false, message: "No URL Found" })
      }
    }
  }
  catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}


module.exports.createURL = createURL
module.exports.getUrl = getUrl

