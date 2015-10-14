$(document).ready(function() {
    //Event handling for button clicks
    $(".start").on("click", function() {
        // This sends the message:
        socket.emit("start", data);
        // This records the action in the database:
        logStart();
    });

    $(".pause").on("click", function() {
        socket.emit("pause", data);
        logPause();
    });

    $(".resume").on("click", function() {
        socket.emit("resume", data);
        logResume();
    });

    $(".stop").on("click", function() {
        socket.emit("stop", data);
        logStop();
    });


    // Helper functions for writing to database:
    // START

    function logStart() {
        // NOTE: function used to be identified as logStart(event). Howeve,r 
        // event.preventDefault();
            // If it is, compile all user info into one object
            var identifyMe = {
                'ident': remote
            }
            // Use AJAX to post the object to our adduser service
            $.ajax({
                type: 'POST',
                url: '/users/remote_start',
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

    // STOP
    function logStop(event) {
        event.preventDefault();
            // If it is, compile all user info into one object
            var identifyMe = {
                'ident': remote
            }
            // Use AJAX to post the object to our adduser service
            $.ajax({
                type: 'POST',
                url: '/users/remote_stop',
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
    function logPause(event) {
        event.preventDefault();
            // If it is, compile all user info into one object
            var identifyMe = {
                'ident': remote
            }
            // Use AJAX to post the object to our adduser service
            $.ajax({
                type: 'POST',
                url: '/users/remote_pause',
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

    function logResume(event) {
        event.preventDefault();
            // If it is, compile all user info into one object
            var identifyMe = {
                'ident': remote
            }
            // Use AJAX to post the object to our adduser service
            $.ajax({
                type: 'POST',
                url: '/users/remote_resume',
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

});