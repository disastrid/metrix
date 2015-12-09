// Userlist data array for filling in info box
var ident = '';


var width = $(window).width();
var height = $(window).height();

// DOM Ready =============================================================
$(document).ready(function() {

    console.log('analyse.js reporting in');

    // Add User button click
    // 3. Add behaviours that happen when a button is clicked. When clicked:
    // a. Slide the group selector up
    // b. show the study buttons
    // c. adjust the text size for the study buttons

    // Then, start with the #second div hidden. 

    $('#overlay').hide();
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

 
// Functions =============================================================


// Add User
    function addUser(x) {
        if (x == 1)
            ident = "Dianne";
        else 
            ident = "Tim";

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
                url: '/analyse/addUser',
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