// JQuery: Document Ready //
$(document).ready(function () {
  // Initial Values //
  var lyricOutput = "";
  var artist = "";
  var song = "";

  var parser;
  var doc;
  var textElement; // Replace 'selector' with the CSS selector of the text element
  var lyrics;
  var lyricsTrim;

  /// *** MAIN FUNCTION ***/// called by submit btn eventlistener, and contains a promise to address asyncronous return of API#1
  function lyricRequest(song, artist) {
    //  First API Call to retrieve music lyrics based artist and song parameters
    jQuery.getJSON(
      "https://www.stands4.com/services/v2/lyrics.php?" +
        "uid=13341" +
        "&tokenid=WWVZNcMlCu5Zn3qf" +
        "&term=" +
        song +
        "&artist=" +
        artist +
        "&format=json",
      function (data) {
        //  JSON object from API call#1
        // console.log(data.result[0]["song-link"], "lyric object"); // logs API JSON object from API call#1
        var link = data.result[0]["song-link"];

        fetch(link)
          .then((response) => response.text())
          .then((html) => {
            // Parse the HTML to find the text you need
            parser = new DOMParser();
            doc = parser.parseFromString(html, "text/html");
            textElement = doc.querySelector("#lyric-body-text"); // Replace 'selector' with the CSS selector of the text element
            lyrics = textElement ? textElement.textContent : "";
            lyricsTrim = lyrics.trim();
            lyricOutput = lyricsTrim.replace(/[\r\n]*/g, ""); // removes returns and output breaks

            console.log(lyricOutput);
          })
          //       .catch((error) => console.error("Error fetching text:", error));
          //   }
          // )
          .then(function shakeTrans() {
            // Second API Call to translate music lyric into Shakespearean English -- Will not execute until first API completes
            var userQuote = lyricOutput.substring(0, 1000);
            console.log(userQuote);
            var queryURL =
              "https://api.funtranslations.com/translate/shakespeare.json?text=" +
              encodeURIComponent(userQuote) +
              "&api_key=tvAcuJbkYE5NX3xLlfaPtAeF";
            var dataJson = JSON.stringify(data);
            $.ajax({
              url: queryURL,
              data: dataJson,
              cache: false,
              type: "POST",
              success: function (response1) {
                console.log(response1, "shakespeare translation object"); // logs API JSON object from API call#2
                translated = response1.contents.translated;
                console.log(translated); // logs translation to console //
                renderScreen2();
              },
              error: function (xhr) {
                console.log(xhr);
              },
            });
          });
      }
    );
  }

  //  User Interface -  event listeners,global execution callbacks
  $(".submit").on("click", function (event) {
    event.preventDefault();
    song = $("#songName").val().trim();
    artist = $("#artistName").val().trim();
    //likeCount = 1;
    if ($(".input").val() == "") {
      $(".modal").addClass("is-active");
      $(".modal-content").append("<p>Please enter an Artist and Song</p>");
    } else {
      //Interaction with Remote Servers & HTML - callback to fire lyricRequest() main function
      console.log(song, artist, "are key UI parameters for cb function ***");
      lyricRequest(song, artist); //  This callback fires main function lyricRequest() with two arguments
      logDatabase(); // Interaction with Database
      // location.reload()
    }
  });
  $(document).on("click", ".delete", function () {
    $(".modal").remove();
  });
  $(".random").on("click", function (event) {
    event.preventDefault();
    var randomArray = [
      { song: "Put Your Hearts Up", artist: "Ariana Grande" },
      { song: "Love Story", artist: "Taylor Swift" },
      { song: "Thunder", artist: "Imagine Dragons" },
      { song: "With Or Without You", artist: "U2" },
      { song: "Shallow", artist: "Lady Gaga" },
      { song: "Leave the City", artist: "21 Pilots" },
      { song: "London Calling", artist: "Clash" },
    ];
    var randomNum = Math.floor(Math.random() * randomArray.length);
    var randomArtist = randomArray[randomNum].artist;
    var randomSong = randomArray[randomNum].song;
    console.log(
      randomArtist,
      randomSong,
      "are random UI parameters for cb function ***"
    );
    lyricRequest(randomSong, randomArtist); //  This callback fires main function lyricRequest() with two arguments
    if ($(".clear")) {
      $(".clear").detach();
    }
    if ($(".search")) {
      $(".search").detach();
    }
  });
  //Audio playback buttons
  $(document).on("click", ".play", function () {
    responsiveVoice.speak($(".translated-text").text(), "US English Male");
  });
  $(document).on("click", ".pause", function () {
    responsiveVoice.pause();
  });
  $(document).on("click", ".resume", function () {
    responsiveVoice.resume();
  });

  // Function to render screen 2
  function renderScreen2() {
    $("#one").hide();
    $("#pTrend").before(
      "<div class='lyric-div'><p class ='translated-text'>" +
        translated +
        "</p></div>"
    );
    var newDiv = $("<div class='translated-buttons'></div>");
    $("#pTrend").before(newDiv);
    //Adding playback button
    $(newDiv).append(
      "<button class='button is-rounded has-text-centered play' type='play'>Play</button>"
    );
    $(newDiv).append(
      "<button class='button is-rounded has-text-centered pause' type='pause'>Pause</button>"
    );
    $(newDiv).append(
      "<button class='button is-rounded has-text-centered resume' type='resume'>Resume</button>"
    );
    //
    $(newDiv).append(
      "<button class='button is-rounded has-text-centered search display' type='submit'>Search</button>"
    );

    $(".search").on("click", function (event) {
      event.preventDefault();
      $("#artistName").val("");
      $("#songName").val("");
      $(".translated-text").hide();
      $(".translated-text").remove();
      $(".search").detach();
      $(".translated-buttons").hide();
      $("#one").show();
    });
  }
});
