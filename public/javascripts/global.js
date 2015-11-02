// Userlist data array for filling in info box
var userListData = [];
var ident = '';
var groupNum = '';
var messageContent = 0;


var width = $(window).width();
var height = $(window).height();



// set other global variables
var setUp = function(){
    width = $(window).width();
    height = $(window).height();
    var conWidth = $('#container').width();
    // using these, calculate how big the buttons should be (45% the width of the container)
    var buttonWidth = Math.floor(conWidth*0.45);
    // Determine a line height for the text. I used 80% of the button width; this works pretty well.
    var lineHeight = Math.floor(buttonWidth * 0.8);
    // Determine a top margin for the 
    var topMargin = Math.floor(height * 0.2);
    // 2. Set these values to the relevant elements: insert buttons, study buttons, text elements. 
    $('#wrapper').css('margin', topMargin + "px auto 0 auto");
    $( ".insertButton1, .insertButton2" ).css( "height", buttonWidth );
    $(".errorButton").css("line-height", height + 'px');
    $(".isGoodButton").css("line-height", height + 'px');
    // Position the alert box near the centre of the screen.
    $("#insideOverlay").css("margin", topMargin + "px auto 0 auto")
                       .css("font-size", Math.floor(height/20) + "px");
    $(".buttonText").css( "line-height", lineHeight*0.9+"px")
                    .css( "font-size", lineHeight*0.15+"px");
}


// DOM Ready =============================================================
$(document).ready(function() {

    setUp();

    // Add User button click
    // 3. Add behaviours that happen when a button is clicked. When clicked:
    // a. Slide the group selector up
    // b. show the study buttons
    // c. adjust the text size for the study buttons

    // Then, start with the #second div hidden. 

    $('#overlay').hide();
    $('#second').hide(); // start with the study buttons hidden
    // Add User button click
    $('.insertButton1').on('click', function() {
        addUserGroup1();        // add the user
        $('#overlay').fadeIn();
        $('#insideOverlay').html('<p>Please wait for the performance to begin. <br />In the meantime you can write your name on your survey book. Your username is:</p> <p class="username">' + ident + '</p>');
        $('#first').hide();     // hide the group buttons
        $('#second').show();    // show the study buttons
    });

    $('.insertButton2').on('click', function(){
        addUserGroup2(); //addUser the user
        $('#overlay').fadeIn();
        $('#insideOverlay').html('<p>Please wait for the performance to begin. <br />In the meantime you can write your name on your survey book. Your username is:</p> <p class="username">' + ident + '</p>');
        $('#first').hide();     // hide the group buttons
        $('#second').show();    // show the study buttons
    });

    // Update doc on isgood button click
    $('.isGoodButton').on('click', function(){
        addIsGood();
    });

    // Update doc on button click
    $('.errorButton').on('click', function(){
        addError();
    });

    // When a message is received by the client from the server:
    // $('#overlay').hide();
    socket.on("start_broadcast", function() {
        // console.log(message);
        console.log("I am a client and I heard a START command!");
        $('#overlay').fadeOut();
        // code here to make UI active when performance begins
    });
    socket.on("start_test_broadcast", function() {
        // console.log(message);
        console.log("I am a client and I heard a START_TEST command!");
        $('#overlay').fadeOut();
        // code here to make UI active when performance begins
    });
    socket.on("end_broadcast", function() {
        console.log("I am a client and I heard an END command!");
        $('#overlay').fadeIn();
        $('#insideOverlay').html('<p>Please fill out your questionnaires for Performance 4: Tim Exile and your End of Performance Survey. Your username is</p> <p class="username">' + ident + '</p><p>Thank you so much for your participation!</p>');
        // code here to stop performance, grey UI, show username and thank for participating
    });
    socket.on("end_test_broadcast", function() {
        console.log("I am a client and I heard an END_TEST command!");
        $('#overlay').fadeIn();
        $('#insideOverlay').html('<p>Please wait for the performance to begin. <br />In the meantime you can write your name on your survey book. Your username is:</p> <p class="username">' + ident + '</p>');
        // code here to stop performance, grey UI, show username and thank for participating
    });
    socket.on("pause_1_broadcast", function() {
        console.log("I am a client and I heard a PAUSE1 command!");
        $('#overlay').fadeIn();
        $('#insideOverlay').html('<p>Please fill out your questionnaire for Performance 1: Dianne Verdonk. Your username is</p> <p class="username">' + ident + '</p>');
        // code here to pause performance, grey UI and show username
    });
    socket.on("pause_2_broadcast", function() {
        console.log("I am a client and I heard a PAUSE1 command!");
        $('#overlay').fadeIn();
        $('#insideOverlay').html('<p>Please fill out your questionnaire for Performance 2: Tim Exile. Your username is</p> <p class="username">' + ident + '</p>');
        // code here to pause performance, grey UI and show username
    });
    socket.on("pause_3_broadcast", function() {
        console.log("I am a client and I heard a PAUSE1 command!");
        $('#overlay').fadeIn();
        $('#insideOverlay').html('<p>Please fill out your questionnaire for Performance 3: Dianne Verdonk. Your username is</p> <p class="username">' + ident + '</p>');
        // code here to pause performance, grey UI and show username
    });
    socket.on("resume_broadcast", function() {
        console.log("I am a client and I heard a resume command!");
        $('#overlay').fadeOut();
        // code here to make UI active again - get rid of pause screen
    });


    socket.on("beforeunload", function(){
        socket.close();
    });
});


// Functions =============================================================

// Listen for orientation changes
window.addEventListener("orientationchange", function() {
    // Announce the new orientation number
    setUp();
}, false);

// Add User
function addUserGroup1() {

    groupNum = "group 1";
    ident = makeWords(2);

    console.log('your ident is: ' + ident);
    console.log('your group number is: ' + groupNum);

        // If it is, compile all user info into one object
        var newUser = {
            'ident' : ident,
            'group': groupNum,
            'date_created': Date()
        }

        // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'POST',
            data: newUser,
            url: '/users/adduser',
            dataType: 'JSON'
        }).done(function( response ) {

            // Check for successful (blank) response
            if (response.msg === '') {

                console.log('user added');
                // window.location.href = "http://localhost:3000";
                //console.log('ident: ' + newUser.ident);
            }
            else {

                // If something goes wrong, alert the error message that our service returned
                alert('Error');
            }
        });
};

// Add User
function addUserGroup2() {

    groupNum = "group 2";
    ident = makeWords(2);

    console.log('your ident is: ' + ident);
    console.log('your group number is: ' + groupNum);


        // If it is, compile all user info into one object
        var newUser = {
            'ident' : ident,
            'group': groupNum,
            'date_created': Date()
        }

        // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'POST',
            data: newUser,
            url: '/users/adduser',
            dataType: 'JSON'
        }).done(function( response ) {

            // Check for successful (blank) response
            if (response.msg === '') {

                console.log('user ' + newUser.ident + ' added, redirecting from global.js ...');
                //console.log('ident: ' + newUser.ident);
            }
            else {

                // If something goes wrong, alert the error message that our service returned
                alert('Error');
            }
        });
};


function addError() {
    // event.preventDefault();
        // If it is, compile all user info into one object
        var identifyMe = {
            'ident': ident
        }
        // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'POST',
            url: '/users/errors',
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

function addIsGood() {
    // event.preventDefault();
        // Send the identifier variable to the database:
        var identifyMe = {
            'ident': ident
        }
        // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'POST',
            url: '/users/isgood',
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
};
function makeWords(options) {
    var output = words(options);
    console.log("initial string: " + output);
    var capped = output[0] + output[1].charAt(0).toUpperCase() + output[1].substring(1);
    console.log('output: ' + capped);
    return capped;
}
