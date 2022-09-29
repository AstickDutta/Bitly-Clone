const express = require('express')
const router = express.Router()
const urlController = require("../controllers/urlController")


router.get('/test', function(req, res){
    return res.send({status: true, msg: "running"})
})

//-----------URL API---------------

router.post('/url/shorten', urlController. createURL)
router.get('/:urlCode', urlController.getUrl)

module.exports = router