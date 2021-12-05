var express = require('express');
var router = express.Router();

const game_controller = require('../controllers/gameController');
const developer_controller = require('../controllers/developerController');
const genre_controller = require('../controllers/genreController');

/* HOME ROUTE */
router.get('/', function (req, res) {
  res.render('index', { title: 'Homepage' });
});

/* GAME ROUTES */
router.get('/game/create', game_controller.game_create_get);
router.post('/game/create', game_controller.game_create_post);
router.get('/game/:id/delete', game_controller.game_delete_get);
router.post('/game/:id/delete', game_controller.game_delete_post);
router.get('/game/:id/update', game_controller.game_update_get);
router.post('/game/:id/update', game_controller.game_update_post);
router.get('/game/:id', game_controller.game_detail);
router.get('/games', game_controller.game_list);

/* DEVELOPER ROUTES */
router.get('/developer/create', developer_controller.developer_create_get);
router.post('/developer/create', developer_controller.developer_create_post);
router.get('/developer/:id/delete', developer_controller.developer_delete_get);
router.post('/developer/:id/delete', developer_controller.developer_delete_post);
router.get('/developer/:id/update', developer_controller.developer_update_get);
router.post('/developer/:id/update', developer_controller.developer_update_post);
router.get('/developer/:id', developer_controller.developer_detail);
router.get('/developers', developer_controller.developer_list);

/* GENRE ROUTES */
router.get('/genre/create', genre_controller.genre_create_get);
router.post('/genre/create', genre_controller.genre_create_post);
router.get('/genre/:id/delete', genre_controller.genre_delete_get);
router.post('/genre/:id/delete', genre_controller.genre_delete_post);
router.get('/genre/:id/update', genre_controller.genre_update_get);
router.post('/genre/:id/update', genre_controller.genre_update_post);
router.get('/genre/:id', genre_controller.genre_detail);
router.get('/genres', genre_controller.genre_list);

module.exports = router;
