const express = require('express');
const controllers = require('./app/controllers');

const routes = express.Router();

//CADASTRO
routes.post('/register', controllers.DevController.store);

//LISTAGEM LIKES E DISLIKES
routes.get('/devs', controllers.DevController.index);
routes.post('/devs/:devId/likes', controllers.LikeController.store);
routes.post('/devs/:devId/dislikes', controllers.DislikeController.store);

//LISTAGEM DE USUARIOS QUE DEI LIKES OU DISLIKES
routes.get('/likes', controllers.LikeController.index);
routes.get('/dislikes', controllers.DislikeController.index);

routes.get('/password', controllers.DevController.comparePass);

module.exports = routes;