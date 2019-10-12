const express = require('express');
const controllers = require('./app/controllers');
const authMiddleware = require('./app/middleware/auth');

const routes = express.Router();

//CADASTRO
routes.post('/register', controllers.DevController.store);
routes.get('/password', controllers.DevController.comparePass);
routes.post('/auth', controllers.DevController.auth)

routes.use(authMiddleware);

//LISTAGEM LIKES E DISLIKES
routes.get('/devs', controllers.DevController.index);
routes.post('/devs/:devId/likes', controllers.LikeController.store);
routes.post('/devs/:devId/dislikes', controllers.DislikeController.store);

//REMOVER LIKES E DISLIKES
routes.delete('/devs/:devId/removeDislike', controllers.DislikeController.delete);
routes.delete('/devs/:devId/removeLike', controllers.LikeController.delete);

//LISTAGEM DE USUARIOS QUE DEI LIKES OU DISLIKES E MATCHS
routes.get('/likes', controllers.LikeController.index);
routes.get('/dislikes', controllers.DislikeController.index);
routes.get('/matchs', controllers.DevController.getMatchs);

module.exports = routes;