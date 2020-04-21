'use strict'

var express = require("express");
var articleController = require("../controllers/article");
var router = express.Router();

var multipart = require("connect-multiparty");
var mdUpload = multipart({ uploadDir: './upload/articles' });

// Test routes
router.get('/testController', articleController.test);
router.post('/datosCurso', articleController.datosCurso);

// Routes
router.post('/save', articleController.save);
router.get('/articles/:last?', articleController.getArticles);
router.get('/article/:id', articleController.getArticle);
router.put('/article/:id', articleController.update);
router.delete('/article/:id', articleController.delete);
router.post('/upload-image/:id', mdUpload, articleController.upload);
router.get('/image/:image', articleController.getImage);
router.get('/search/:search', articleController.search);

module.exports = router;
