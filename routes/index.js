var express = require('express');
var router = express.Router();
var Downloader = require("./downloader");
const fs = require('fs');

var dl = new Downloader();
var i = 0;
const axios = require('axios')
const cheerio = require('cheerio')
const fsLibrary  = require('fs');
const { stringify } = require('querystring');
const { Client } = require("youtubei");
const youtube = new Client();
var path = require('path');

/* GET home page. */

router.get('/',async function (req, res, next) {
  res.render('home');
});

router.get('/:spotifyID',async function (req, res, next) {
  axios.get('https://open.spotify.com/playlist/'+req.params.spotifyID).then((response) => {
          const $ = cheerio.load(response.data);
          const urlElems = $("script");
          var r = urlElems[5].children[0].data;
        
          r = r.substring(39,r.length-5);
          r = JSON.parse(r);
          
          console.log(r.tracks.items[3].track.artists[0].name);
          res.render('index',{playlist:r});
        });
});

router.get('/download/:name/:artists', async function (req,res,next) {
  console.log(req.params.name);
  var str = req.params.name + ' '+ req.params.artists;
  // var mp3file = new File(path.resolve("./public/audios/"+req.params.name + '.mp3'));
  if(fs.existsSync(path.resolve("./public/audios/"+req.params.name + '.mp3'))) {
    res.download(path.resolve("./public/audios/"+req.params.name + '.mp3'));

  } else 
  {const videos = await youtube.search(str, {
		type: "video", // video | playlist | channel | all
	});
  console.log(videos[0].id);
  await dl.getMP3({videoId: videos[0].id, name: req.params.name+'.mp3'}, function(err,response){
    i++;
    console.log('fdg');
    if(err)
        throw err;
    else{

        console.log("Song "+ i + " was downloaded: " + response.file);


        res.download(path.resolve("./public/audios/"+req.params.name + '.mp3'));
        // res.render('download',{link:""})
      }
  });
}

})
module.exports = router;
