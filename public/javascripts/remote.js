$(document).ready(function() {


    //Event handling for button clicks
    $(".start").on("click", function() {
        // This sends the message:
        // var data = {message: 1};
        socket.emit("start_broadcast", {'message': 'There has been a pause received'});
        console.log("I am the remote and I sent a START command!");
        // This records the action in the database:
        logStart();
    });

    $(".pause").on("click", function() {
        socket.emit("pause_broadcast", {'message': 'There has been a pause received'});
        console.log("I am the remote and I sent a PAUSE command!");
        logPause();
    });

    $(".resume").on("click", function() {
        socket.emit("resume_broadcast", {'message': 'There has been a resume received'});
        console.log("I am the remote and I sent a RESUME command!");
        logResume();
    });

    $(".end").on("click", function() {
        socket.emit("end_broadcast", {'message': 'There has been an end received'});
        console.log("I am the remote and I sent an END command!");
        logEnd();
    });

    $(window).on('beforeunload', function(){
        socket.close();
    });


    // Helper functions for writing to database:
    // START

    function logStart() {
        // NOTE: function used to be identified as logStart(event). Howeve,r 
        // event.preventDefault();
            // If it is, compile all user info into one object
            var ident = 'remote';
            var identifyMe = {
                'ident': ident
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
                    console.log("Successfully logged START time for '" + ident + "' user.");
                }
                else {
                    // If something goes wrong, alert the error message that our service returned
                    console.log('Error detected. Response was: ' + response);
                }
            });
    };


    
    function logPause() {
        // event.preventDefault();
            // If it is, compile all user info into one object
            var ident = 'remote';
            var identifyMe = {
                'ident': ident
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
                    console.log("Successfully logged PAUSE time for '" + ident + "' user.");
                }
                else {
                    // If something goes wrong, alert the error message that our service returned
                    console.log('Error detected. Response was: ' + response);
                }
            });
    };

    // STOP
    function logEnd() {
        
            // If it is, compile all user info into one object
            var ident = 'remote';
            var identifyMe = {
                'ident': ident
            }
            // Use AJAX to post the object to our adduser service
            $.ajax({
                type: 'POST',
                url: '/users/remote_end',
                data: identifyMe,
                dataType: 'JSON'
            }).done(function( response ) {
                // Check for successful (blank) response
                if (response.msg === '') {
                    console.log("Successfully logged END time for '" + ident + "' user.");
                }
                else {
                    // If something goes wrong, alert the error message that our service returned
                    console.log('Error detected. Response was: ' + response);
                }
            });
    };

    function logResume() {
        // event.preventDefault();
            // If it is, compile all user info into one object
            var ident = 'remote';
            var identifyMe = {
                'ident': ident
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
                    console.log("Successfully logged RESUME time for '" + ident + "' user.");
                }
                else {
                    // If something goes wrong, alert the error message that our service returned
                    console.log('Error detected. Response was: ' + response);
                }
            });
    };

});