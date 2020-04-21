'use strict'

var Validator = require("validator");
var Article = require("../models/article");
var fs = require("fs");
var path = require("path");

var controller = {
  datosCurso: (req, res) => {
    var param = req.body.param;

    return res.status(200).send({
      curso: 'Master en frameworks JS',
      autor: 'Victor Robles',
      alumno: 'Fernando Esquitino',
      param
    });
  },

  test: (req, res) => {
    return res.status(200).send({
      message: "I'm test action of my articles controller"
    });
  },

  save: (req, res) => {
    var params = req.body;

    try {
      var validateTitle = !Validator.isEmpty(params.title);
      var validateContent = !Validator.isEmpty(params.content);
    } catch (err) {
      return res.status(200).send({
        status: 'error',
        message: 'Faltan datos'
      });
    }

    if (!validateTitle || !validateContent) {
      return res.status(200).send({
        status: 'error',
        message: 'Faltan datos'
      });
    }

    var article = new Article();
    article.title = params.title;
    article.content = params.content;
    article.image = null;

    article.save((err, articleStored) => {
      if (err || !articleStored) {
        return res.status(500).send({
          status: 'error',
          message: 'No guardado'
        });
      }

      return res.status(200).send({
        status: 'success',
        article
      });
    });
  },

  getArticles: (req, res) => {
    var last = req.params.last;
    var query = Article.find({});

    if (last !== undefined) {
      query.limit(5);
    }

    query.sort('-_id').exec((err, articles) => {
      if (err) {
        return res.status(500).send({
          status: 'error',
          message: 'Error al devolver los datos'
        });
      }

      if (!articles) {
        return res.status(200).send({
          status: 'error',
          message: 'No hay articulos'
        });
      }

      return res.status(200).send({
        status: 'success',
        articles
      });
    });
  },

  getArticle: (req, res) => {
    var articleId = req.params.id;

    if (!articleId || articleId == null) {
      return res.status(404).send({
        status: 'error',
        message: 'No hay articulos'
      });
    }

    Article.findById(articleId, (err, article) => {
      if (err || !article) {
        return res.status(404).send({
          status: 'error',
          message: 'No existe el articulo'
        });
      }

      return res.status(200).send({
        status: 'success',
        article
      });
    });
  },

  update: (req, res) => {
    var articleId = req.params.id;
    var params = req.body;

    try {
      var validateTitle = !Validator.isEmpty(params.title);
      var validateContent = !Validator.isEmpty(params.content);
    } catch (err) {
      return res.status(200).send({
        status: 'error',
        message: 'Faltan datos'
      });
    }

    if (!validateTitle || !validateContent) {
      return res.status(200).send({
        status: 'error',
        message: 'Validacion incorrecta'
      });
    }

    Article.findOneAndUpdate({
      _id: articleId
    },
      params,
      { new: true },
      (err, articleUpdated) => {
        if (err) {
          return res.status(500).send({
            status: 'error',
            message: 'Error al actualizar',
            err
          });
        }

        if (!articleUpdated) {
          return res.status(404).send({
            status: 'error',
            message: 'No existe el articulo'
          });
        }

        return res.status(200).send({
          status: 'success',
          article: articleUpdated
        });
      });
  },

  delete: (req, res) => {
    var articleId = req.params.id;

    Article.findOneAndDelete({ _id: articleId }, (err, articleDeleted) => {
      if (err) {
        return res.status(500).send({
          status: 'error',
          message: 'Error al borrar',
          err
        });
      }

      if (!articleDeleted) {
        return res.status(404).send({
          status: 'error',
          message: 'No existe el articulo'
        });
      }

      return res.status(200).send({
        status: 'success',
        article: articleDeleted
      });
    });
  },

  upload: (req, res) => {
    if (!req.files) {
      return res.status(404).send({
        status: 'error',
        message: 'No se ha subido la imagen'
      });
    }

    var filePath = req.files.file0.path;
    var fileSplit = filePath.split('/');
    var fileName = fileSplit[2];
    var fileExt = fileName.split('\.')[1];

    if (fileExt != 'png' && fileExt != 'jpg' && fileExt != 'jpeg' && fileExt != 'gif') {
      fs.unlink(filePath, (err) => {
        return res.status(500).send({
          status: 'error',
          message: 'Extension invalid',
          extension: fileExt
        });
      });
    } else {
      var articleId = req.params.id;

      Article.findOneAndUpdate({ _id: articleId }, { image: fileName }, { new: true }, (err, articleUpdated) => {
        if (err || !articleUpdated) {
          return res.status(500).send({
            status: 'error',
            message: 'Error al actualizar el articulo'
          });
        }

        return res.status(200).send({
          status: 'success',
          article: articleUpdated
        });
      });
    }
  },

  getImage: (req, res) => {
    var file = req.params.image;
    var pathFile = './upload/articles/' + file;

    fs.exists(pathFile, (exists) => {
      if (exists) {
        return res.sendFile(path.resolve(pathFile));
      } else {
        return res.status(404).send({
          status: 'error',
          message: 'Image not found'
        });
      }
    })
  },

  search: (req, res) => {
    var search = req.params.search;

    Article.find({
      "$or": [
        { "title": { "$regex": search, "$options": "i" } },
        { "content": { "$regex": search, "$options": "i" } }
      ]
    }).sort([['date', 'descending']])
      .exec((err, articles) => {
        if (err) {
          return res.status(500).send({
            status: 'error',
            message: err
          });
        }

        if (!articles || articles.length <= 0) {
          return res.status(404).send({
            status: 'error',
            message: 'Articles not found'
          });
        }

        return res.status(200).send({
          status: 'success',
          articles
        });
      });
  }
}

module.exports = controller;
