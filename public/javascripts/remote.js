$(document).ready(function() {

    console.log("remote.js checking in");
    console.log("**Socket.IO Version: " + require('socket.io/package').version);
    //Event handling for button clicks
    // START AND END TEST:

    $(".start_test").on("click", function() {
        // This sends the message:
        // var data = {message: 1};
        socket.emit("start_test_broadcast", {'message': 'There has been a START_TEST received'});
        console.log("I am the remote and I sent a START_TEST command!");
        // This records the action in the database:
        logTestStart();
    });

    $(".end_test").on("click", function() {
        // This sends the message:
        // var data = {message: 1};
        socket.emit("end_test_broadcast", {'message': 'There has been a END_TEST received'});
        console.log("I am the remote and I sent a END_TEST command!");
        // This records the action in the database:
        logTestEnd();
    });

    // Start the performance:

    $(".start").on("click", function() {
        // This sends the message:
        // var data = {message: 1};
        socket.emit("start_broadcast", {'message': 'There has been a pause received'});
        console.log("I am the remote and I sent a START command!");
        // This records the action in the database:
        logStart();
    });

    // End the performance:

    $(".end").on("click", function() {
        socket.emit("end_broadcast", {'message': 'There has been an end received'});
        console.log("I am the remote and I sent an END command!");
        logEnd();
    });

    // Pause the interface after performances 1, 2, and 3:

    $(".pause1").on("click", function() {
        socket.emit("pause_1_broadcast", {'message': 'There has been a PAUSE1 received'});
        console.log("I am the remote and I sent a PAUSE1 command!");
        logPause1();
    });

    $(".pause2").on("click", function() {
        socket.emit("pause_2_broadcast", {'message': 'There has been a PAUSE2 received'});
        console.log("I am the remote and I sent a PAUSE2 command!");
        logPause2();
    });

    $(".pause3").on("click", function() {
        socket.emit("pause_3_broadcast", {'message': 'There has been a PAUSE1 received'});
        console.log("I am the remote and I sent a PAUSE3 command!");
        logPause3();
    });

    // resume the UI for the performance:

    $(".resume").on("click", function() {
        socket.emit("resume_broadcast", {'message': 'There has been a resume received'});
        console.log("I am the remote and I sent a RESUME command!");
        logResume();
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
                url: '/remote/remote_start',
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
                url: '/remote/remote_end',
                data: identifyMe,
                dataType: 'JSON'
            }).done(function( response ) {
                // Check for successful (blank) response
                if (response.msg === '') {
                    console.log("Successfully logged END time for the remote user.");
                }
                else {
                    // If something goes wrong, alert the error message that our service returned
                    console.log('Error detected. Response was: ' + response);
                }
            });
    };

    function logTestStart() {
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
                url: '/remote/remote_test_start',
                data: identifyMe,
                dataType: 'JSON'
            }).done(function( response ) {
                // Check for successful (blank) response
                if (response.msg === '') {
                    console.log("Successfully logged TEST_START time for the remote user.");
                }
                else {
                    // If something goes wrong, alert the error message that our service returned
                    console.log('Error detected. Response was: ' + response);
                }
            });
    };

    function logTestEnd() {
    
        // If it is, compile all user info into one object
        var ident = 'remote';
        var identifyMe = {
            'ident': ident
        }
        // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'POST',
            url: '/remote/remote_test_end',
            data: identifyMe,
            dataType: 'JSON'
        }).done(function( response ) {
            // Check for successful (blank) response
            if (response.msg === '') {
                console.log("Successfully logged TEST_END time for the remote user.");
            }
            else {
                // If something goes wrong, alert the error message that our service returned
                console.log('Error detected. Response was: ' + response);
            }
        });
    };

    
    function logPause1() {
        // event.preventDefault();
            // If it is, compile all user info into one object
            var ident = 'remote';
            var identifyMe = {
                'ident': ident
            }
            // Use AJAX to post the object to our adduser service
            $.ajax({
                type: 'POST',
                url: '/remote/remote_pause1',
                data: identifyMe,
                dataType: 'JSON'
            }).done(function( response ) {
                // Check for successful (blank) response
                if (response.msg === '') {
                    console.log("Successfully logged PAUSE1 time for the remote user.");
                }
                else {
                    // If something goes wrong, alert the error message that our service returned
                    console.log('Error detected. Response was: ' + response);
                }
            });
    };

    function logPause2() {
        // event.preventDefault();
            // If it is, compile all user info into one object
            var ident = 'remote';
            var identifyMe = {
                'ident': ident
            }
            // Use AJAX to post the object to our adduser service
            $.ajax({
                type: 'POST',
                url: '/remote/remote_pause2',
                data: identifyMe,
                dataType: 'JSON'
            }).done(function( response ) {
                // Check for successful (blank) response
                if (response.msg === '') {
                    console.log("Successfully logged PAUSE2 time for the remote user.");
                }
                else {
                    // If something goes wrong, alert the error message that our service returned
                    console.log('Error detected. Response was: ' + response);
                }
            });
    };

    function logPause3() {
        // event.preventDefault();
            // If it is, compile all user info into one object
            var ident = 'remote';
            var identifyMe = {
                'ident': ident
            }
            // Use AJAX to post the object to our adduser service
            $.ajax({
                type: 'POST',
                url: '/remote/remote_pause3',
                data: identifyMe,
                dataType: 'JSON'
            }).done(function( response ) {
                // Check for successful (blank) response
                if (response.msg === '') {
                    console.log("Successfully logged PAUSE3 time for the remote user.");
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
                url: '/remote/remote_resume',
                data: identifyMe,
                dataType: 'JSON'
            }).done(function( response ) {
                // Check for successful (blank) response
                if (response.msg === '') {
                    console.log("Successfully logged RESUME time for the remote user.");
                }
                else {
                    // If something goes wrong, alert the error message that our service returned
                    console.log('Error detected. Response was: ' + response);
                }
            });
    };

});