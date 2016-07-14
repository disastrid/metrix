
$(document).ready(function() {
      // Report script loading and variables
      console.log('posthoc.js reporting in');
      console.log('start playing at ' + playStart + ' seconds');
      // Get height and width of window to position dialog box.
      var width = $(window).width();
      var height = $(window).height();
      var topMargin = Math.floor(height * 0.15);

      $('#overlay').hide();
      
      // Tell us who we're analysing
      if (num == 1) {
        console.log('we are analysing player ' + num);
      }
      else {
        console.log('we are analysing player ' + num);
      }

      // Run setup
      setUp();
      

      $("#insideOverlay").css("margin", topMargin + "px auto 0 auto")
         .css("font-size", Math.floor(height/20) + "px");

      // Make the start button react to mousing over
      $("#posthoc_start").mouseover(function() {
        $(this).css('background-color', '#000000');
      });
      $("#posthoc_start").mouseout(function() {
        $(this).css('background-color', '#0000ff');
      });


      // When the start button is pressed:
      $("#posthoc_start").click(function(event) {
        console.log("boom");
        // Fade in the overlay, and the dialog box that will begin the video and analysis on click.
        $('#overlay').fadeIn(500);
        $('#insideOverlay').fadeIn(800).html('<p>Please click here to begin analysis</p>');
        // Hide the start button and its text
        $('.text_posthoc_start').hide();
        $(this).slideUp(800);
        // Fade in the green and red feedback buttons
        $("#posthoc_feedback").fadeIn(800);
      });

      // Then, when the dialog is clicked: 
      $('#insideOverlay').click(function() {
        // Add the user to the database
        addUser(num);
        // Fade out the overlay to make the screen active, and start the video.
        $('#overlay').fadeOut();
        startPlaying = true;
        player.playVideo();
        return false;
      });
      


      // Update doc on isgood button click
      $('#posthoc_isGood').on('click', function(){
          analyse_addIsGood();
          $(this).hide();
          $(this).fadeIn(200);

      });

      // Update doc on button click
      $('#posthoc_error').on('click', function(){
          analyse_addError();
          $(this).hide();
          $(this).fadeIn(200);

      });


});



// Functions =============================================================

// Setup
    function setUp() {
        $("#posthoc_feedback").hide();
        
    }

// Add User
    function addUser(num) {
        if (num == 1) {
          ident = 'Dianne';
        }
        else {
          ident = 'Tim';
        }
        // Log the ident so we can be sure it's correct:
        console.log('your ident is: ' + ident);
            // If it is, compile all user info into one object
        var newUser = {
            'ident' : ident,
            'date_created': Date()
        }

          // Use AJAX to post the object to our adduser service
          $.ajax({
              type: 'POST',
              data: newUser,
              url: '/analyse/analyse_addUser',
              dataType: 'JSON'
          }).done(function( response ) {

            // Check for successful (blank) response
            if (response.msg === '') {
              // if successful, send this:
              console.log('user added');
            }
            else {
              // If something goes wrong, alert the error message that our service returned
              alert('Error adding user');
            }
          });
    };

    // add an error stamp to the database
    function analyse_addError() {
        // event.preventDefault();
            // If it is, compile all user info into one object
            var identifyMe = {
                'ident': ident
            }
            // Use AJAX to post the object to our adduser service
            $.ajax({
                type: 'POST',
                url: '/analyse/analyse_addError',
                data: identifyMe,
                dataType: 'JSON'
            }).done(function( response ) {
                // Check for successful (blank) response
                if (response.msg === '') {
                    console.log("successfully updated ERROR fields with ident " + ident);
                }
                else {
                    // If something goes wrong, alert the error message that our service returned
                    console.log('Error detected. Response was: ' + response);
                }
            });
    };

    // add an IsGood stamp to the database
    function analyse_addIsGood() {
        // event.preventDefault();
            // Send the identifier variable to the database:
            var identifyMe = {
                'ident': ident
            }
            // Use AJAX to post the object to our adduser service
            $.ajax({
                type: 'POST',
                url: '/analyse/analyse_addIsGood',
                data: identifyMe,
                dataType: 'JSON'
            }).done(function( response ) {
                // Check for successful (blank) response
                if (response.msg === '') {
                    console.log("successfully updated GOOD fields with ident " + ident);
                }
                else {
                    // If something goes wrong, alert the error message that our service returned
                    console.log('Error detected. Response was: ' + response);
                }
            });
}; // end $(document).ready function

// ========== YOUTUBE API FUNCTIONS ==========

// Load the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Create the <iframe> and YT.Player object after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
  
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    videoId: uniqueId,
    playerVars: {
      'showinfo': 0,
      'controls': 0,
      'autoplay': 0,
      'fs': 0
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
  
}

// The API will call this function when the video player is ready.

function onPlayerReady(event) {
  // playStart is defined in the head of the HTML document. That way we can reuse this code for each video.
  event.target.cueVideoById(uniqueId, playStart);
}

//  The API calls this function when the player's state changes. The function indicates that when playing a video (state=1),
//  the player should play for six seconds and then stop.
var startPlaying = false;
function onPlayerStateChange(event) {
  if (event.data != YT.PlayerState.PLAYING && startPlaying == false) {
      player.stopVideo();
  }
  if (event.data == YT.PlayerState.PAUSED) {
      player.playVideo();
  }
}

// This stops the video.
function stopVideo() {
  player.stopVideo();
}

