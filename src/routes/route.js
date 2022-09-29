const express = require('express')
const router = express.Router()
const urlController = require("../controllers/urlController")


router.get('/test', function(req, res){
    return res.send({status: true, msg: "running"})
})

module.exports = router