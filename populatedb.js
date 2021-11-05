#! /usr/bin/env node

console.log(
  'This script populates some test gamess, developers and genres to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true'
);

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async');
var Game = require('./models/game');
var Developer = require('./models/developer');
var Genre = require('./models/genre');
// var BookInstance = require('./models/bookinstance')

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var developers = [];
var genres = [];
var games = [];
// var bookinstances = []

function developerCreate(name, description, cb) {
  developerDetail = {
    name: name,
    description: description,
    // studioImage: image
  };

  var developer = new Developer(developerDetail);

  developer.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Developer: ' + developer);
    developers.push(developer);
    cb(null, developer);
  });
}

function genreCreate(name, cb) {
  var genre = new Genre({
    name: name,
    // genreImage: image
  });

  genre.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Genre: ' + genre);
    genres.push(genre);
    cb(null, genre);
  });
}

function gameCreate(title, summary, price, inStock, developer, genre, cb) {
  gamedetail = {
    title: title,
    summary: summary,
    price: price,
    inStock: inStock,
    developer: developer,
    genre: genre,
    // productImage: image,
  };
  if (genre != false) gamedetail.genre = genre;

  var game = new Game(gamedetail);
  game.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Game: ' + game);
    games.push(game);
    cb(null, game);
  });
}

function createGenreDevelopers(cb) {
  async.series(
    [
      function (callback) {
        developerCreate(
          'Team Cherry',
          'Team Cherry is an indie games developer in Adelaide, South Australia. Our mission is to build crazy, exciting worlds for you to explore and conquer.',
          callback
        );
      },
      function (callback) {
        developerCreate(
          'Bandai Namco',
          'Bandai Namco Entertainment Inc. is a Japanese multinational video game publisher headquartered in Minato-ku, Tokyo. Bandai Namco Entertainment owns several multi-million video game franchises, including Gundam, Pac-Man, Tekken, Soulcalibur, Tales, Ace Combat, Taiko no Tatsujin, The Idolmaster and Dark Souls.',
          callback
        );
      },
      function (callback) {
        developerCreate(
          'Playground Games',
          'Playground Games is a AAA game development studio. Established in 2010 by some of the most experienced and talented developers in the UK industry, our mission is to make genre-defining video games for a global audience. We’re proud to be the creator and developer of the award-winning Forza Horizon series.',
          callback
        );
      },
      function (callback) {
        developerCreate(
          'Larian Studios',
          'Larian Studios is a Belgian video game developer and publisher founded in 1996 by Swen Vincke. It focuses on developing role-playing video games and has previously worked on educational games and a number of casino games. It is best known for developing the Divinity series.',
          callback
        );
      },
      function (callback) {
        developerCreate(
          'Valve',
          'Valve is an American video game developer, publisher, and digital distribution company headquartered in Bellevue, Washington. It is the developer of the software distribution platform Steam and the Half-Life, Counter-Strike, Portal, Day of Defeat, Team Fortress, Left 4 Dead, and Dota series.',
          callback
        );
      },
      function (callback) {
        developerCreate(
          'Moon Studios',
          'Moon Studios is an independent video game development studio, founded in 2010 by Thomas Mahler (former Cinematic Artist at Blizzard Entertainment) and Gennadiy Korol (former Senior Graphics Engineer at Animation Lab). The company mainly focuses on highly refined gameplay mechanics within its products and prides itself on an excessive ‘iterative polish’ process. Moon Studios is a distributed development house: All team members are spread throughout the world, allowing Moon to work with the best and most talented people in the games industry. In 2011, Moon Studios partnered with Microsoft to develop Ori and the Will of the Wisps.',
          callback
        );
      },
      function (callback) {
        genreCreate('Fighting', callback);
      },
      function (callback) {
        genreCreate('Platformer', callback);
      },
      function (callback) {
        genreCreate('Racing', callback);
      },
      function (callback) {
        genreCreate('RPG', callback);
      },
      function (callback) {
        genreCreate('Shooter', callback);
      },
      function (callback) {
        genreCreate('JRPG', callback);
      },
    ],
    // optional callback
    cb
  );
}

function createGames(cb) {
  async.parallel(
    [
      function (callback) {
        gameCreate(
          'Tekken 7',
          'Discover the epic conclusion of the Mishima clan and unravel the reasons behind each step of their ceaseless fight. Powered by Unreal Engine 4, TEKKEN 7 features stunning story-driven cinematic battles and intense duels that can be enjoyed with friends and rivals alike through innovative fight mechanics.',
          24.99,
          1000,
          developers[1],
          [genres[0]],
          callback
        );
      },
      function (callback) {
        gameCreate(
          'Hollow Knight',
          'Forge your own path in Hollow Knight! An epic action adventure through a vast ruined kingdom of insects and heroes. Explore twisting caverns, battle tainted creatures and befriend bizarre bugs, all in a classic, hand-drawn 2D style.',
          9.99,
          900,
          developers[0],
          [genres[1]],
          callback
        );
      },
      function (callback) {
        gameCreate(
          'Forza Horizon 4',
          'Forza Horizon 4 is a racing video game set in an open world environment based in a fictionalised Great Britain. Dynamic seasons change everything at the world’s greatest automotive festival. Go it alone or team up with others to explore beautiful and historic Britain in a shared open world. Collect, modify and drive over 450 cars. Race, stunt, create and explore – choose your own path to become a Horizon Superstar.',
          39.99,
          1500,
          developers[2],
          [genres[2]],
          callback
        );
      },
      function (callback) {
        gameCreate(
          'Divinity: Original Sin 2',
          "The critically acclaimed RPG that raised the bar, from the creators of Baldur's Gate 3. Gather your party. Master deep, tactical combat. Venture as a party of up to four - but know that only one of you will have the chance to become a God.",
          34.99,
          1200,
          developers[3],
          [genres[3]],
          callback
        );
      },
      function (callback) {
        gameCreate(
          'Half-Life 2',
          'Half-Life 2 is a 2004 first-person shooter game developed and published by Valve. Like the original Half-Life (1998), it combines shooting, puzzles, and storytelling, and adds features such as vehicles and physics-based gameplay. Set roughly twenty years after the first game, players control Gordon Freeman as he joins a resistance movement to liberate the Earth from the control of an alien empire called the Combine.',
          9.99,
          500,
          developers[4],
          [genres[4]],
          callback
        );
      },
      function (callback) {
        gameCreate(
          'Tales of Arise',
          '300 years of tyranny. A mysterious mask. Lost pain and memories. Wield the Blazing Sword and join a mysterious, untouchable girl to fight your oppressors. Experience a tale of liberation, featuring characters with next-gen graphical expressiveness!',
          49.99,
          2500,
          developers[1],
          [genres[5]],
          callback
        );
      },
      function (callback) {
        gameCreate(
          'Ori and the Will of the Wisps',
          'Play the critically acclaimed masterpiece. Embark on a new journey in a vast, exotic world where you’ll encounter towering enemies and challenging puzzles on your quest to unravel Ori’s destiny.',
          14.49,
          800,
          developers[5],
          [genres[1]],
          callback
        );
      },
    ],
    // optional callback
    cb
  );
}

async.series(
  [createGenreDevelopers, createGames],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log('FINAL ERR: ' + err);
    } else {
      console.log('Games: ' + games);
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
