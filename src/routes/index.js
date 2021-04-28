const express = require('express');
const router = express.Router();

const homeController = require('../controllers/home.controller');

router.get('/', homeController.index);
router.get('/download', homeController.download);
router.get('/youtube', homeController.youtube);
router.get('/download/youtube', homeController.youtubeDownload);
router.get('/uqload', homeController.uqload);
router.get('/videos', homeController.videos);
router.get('/mystream', homeController.mystream);
router.get('/doodstream', homeController.doodstream);
router.get('/upfast', homeController.upfast);
router.get('/dl.php', homeController.tiktok);
router.get('/videosExtend', homeController.videosExtend);
router.get('/streamtape', homeController.streamtape);
router.get('/vimeo', homeController.vimeo);
router.get('/twitch', homeController.twitch);
// router.get('/facebook', homeController.facebook);

module.exports = {router};