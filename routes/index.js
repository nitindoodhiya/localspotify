var express = require('express');
var router = express.Router();
var Downloader = require("./downloader");
const fs = require('fs');
const AUDIO_PATH = "./public/audios/";
var dl = new Downloader();
var i = 0;
const axios = require('axios')
const cheerio = require('cheerio')
const fsLibrary = require('fs');
const { stringify } = require('querystring');
const { Client } = require("youtubei");
const youtube = new Client();
var path = require('path');
router.use(express.json());
/* GET home page. */

router.get('/', async function (req, res, next) {
    res.render('home');
});

// req.body {
//     name: "name"
// }  suppose to be 

router.post('/generatelink', async function (req, res, next) {
    let data = JSON.parse(req.body.data);
    let song_name = data.name;
    data.artists.forEach(e => {
        song_name += " " + e.name;
    });
    if (fs.existsSync(path.resolve(AUDIO_PATH + song_name + '.mp3'))) {
        res.send({
            "status": 200,
            "message": "Song Available now"
        });
    } else {
        const videos = await youtube.search(song_name, {
            type: "video", // video | playlist | channel | all
        });
        console.log(videos[0].id);
        await dl.getMP3({ videoId: videos[0].id, name: song_name + '.mp3' }, function (err, response) {
            i++;
            console.log('fdg');
            if (err) {
                console.log(err);
                res.send({
                    "status": 500,
                    "message": "Mamla Internal Hai"
                });
            }
            else {
                console.log("Song " + i + " was downloaded: " + response.file);
                res.send({
                    "status": 200,
                    "message": "Song Available now"
                });
            }
        });
    }
});
router.get('/downloadsong/:song_name', async function (req, res, next) {
    let song_name = req.params.song_name;
    if (fs.existsSync(path.resolve(AUDIO_PATH + song_name + '.mp3'))) {
        res.download(path.resolve(AUDIO_PATH + song_name + '.mp3'))
    } else {
        res.send("NOT AVAILABLE")
    }
});
router.get('/errorsong/:song_name', async function (req, res, next) {
    let song_name = req.params.song_name;
    res.send("SONG COULD NOT BE DOWNLOADED FOR SOME REASONS: "+ song_name);
});

router.get('/:spotifyID', async function (req, res, next) {
    if (req.params.spotifyID !== "favicon.ico")
        axios.get('https://open.spotify.com/playlist/' + req.params.spotifyID).then((response) => {
            const $ = cheerio.load(response.data);
            const urlElems = $("script");
            var r = urlElems[5].children[0].data;

            r = r.substring(39, r.length - 5);
            r = JSON.parse(r);

            console.log(r.tracks.items[3].track.artists[0].name);
            res.render('index', { Jsonplaylist: JSON.stringify(r), playlist: r, items: JSON.stringify(r.tracks.items) });
        }).catch((error) => {
            console.log(error);
            res.send('cannot find the song mp3')
        });
    else res.send("not found");
});


module.exports = router;