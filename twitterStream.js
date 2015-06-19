var Twitter = require('twitter'); // client library module for opening twitter stream (npm install twitter)

var stopWords = require('stopwords').english; // node module of stop words (npm install stopwords)

var client = new Twitter({
  //normally I would put these keys in a local file that would be in my .gitignore
  //but I wanted to make sure the code runs for you
  consumer_key: "6GOxs7fVD1E3g6yufwbjkucsD",
  consumer_secret: "HLXIcPLhQdqpkfhv5wbvufJIOVBkdQio1eRtnPTe9kbBT2TobK",
  access_token_key: "250698626-rHsG7596mlB2sqAKkTV1mPB1K0hmEW8Xe3KqsHtk",
  access_token_secret: "DH6orG7rqLI2ihDAci9OnSqRNoYS5qduuGCL1uDYb73S5"
});

var topTen = {},
    allWords = {},
    total = 0;


function addToTotal (text) {
// stores the count for every non-stop word to track top ten
  text.forEach(function(word) {
    if (!allWords[word]) {
      allWords[word] = 0;
    }
    allWords[word]++;
  });
}

function updateTopTen (text) {
  //grabs the word with the tenth highest frequency
  var min = Infinity,
      numberTen = '';
  for (var word in topTen) {
    if (topTen[word] < min) {
      numberTen = word;
      min = topTen[word];
    }
  }
  text.forEach (function (word) {
    //goes through each word in the tweet - if it's already in the top ten, just increases the count
    if (topTen[word]) {
      topTen[word] = allWords[word];
    } else {
      if (Object.keys(topTen).length===11) {
        delete topTen[numberTen]
      }
      // if the count for this word is higher than the tenth highest, replaces it
      if (Object.keys(topTen).length === 10 && allWords[word] > min) {
        delete topTen[numberTen];
        topTen[word] = allWords[word];
      } else if (Object.keys(topTen).length <10) {
        topTen[word] = allWords[word];
      }
    }
  })
  console.log('top', topTen)
  console.log('total', total)
}

function getTweets () {
  var now = new Date();
  //formats current time to UTC
  var nowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
  //opens stream to statuses/sample
  client.stream('statuses/sample.json', {language:'en'}, function(stream) {
    stream.on('data', function(tweet) {
      //converts tweet created at time to UTC in order to compare to current time
      var tweetTime = Date.parse(tweet.created_at);
      var tweetDate = new Date(tweetTime);
      var tweetUTC = Date.UTC(tweetDate.getUTCFullYear(), tweetDate.getUTCMonth(), tweetDate.getUTCDate(),  tweetDate.getUTCHours(), tweetDate.getUTCMinutes(), tweetDate.getUTCSeconds());
      if (Math.abs(nowUTC-tweetTime) < 300000) {
        var text = tweet.text.toLowerCase().split(' ');
        //converts each tweet to an array of actual words that aren't stop words
        text = text.filter(function(word) {
          total++;
          var re = /^[a-z]+$/
          return re.test(word) && stopWords.indexOf(word) === -1 && word!=='rt';
        })
        addToTotal(text);
        updateTopTen(text);
      }
    });

    stream.on('end', function() {
      console.log('Total Words: ', total);
      console.log('Top Ten Words: ', topTen)
    })

    stream.on('error', function(error) {
      throw error;
    });
  });
};

getTweets();

