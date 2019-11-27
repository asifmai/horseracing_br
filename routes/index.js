var express = require('express');
var router = express.Router();
const indexController = require('../controllers/indexcontroller');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* POST Details Page. */
router.post('/details', indexController.details_post);

/* POST Get Page Data. */
router.post('/pagedata', indexController.pagedata_post);



module.exports = router;
