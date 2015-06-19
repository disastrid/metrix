/* This is the JS that's served to every person who logs onto the site. */

$(document).ready(function() {
    var groupId = '';
    $("body").on("click", "#button01", function() {
        counter.add();
        console.log(counter);
        groupId = "group 1";
        generateGroupIdPrepend(1);
        console.log(groupId);

        // enterGroup(1)
        });
    $("body").on("click", "#button02", function() {
        groupId = "group 2";
        generateGroupIdPrepend(2);
        console.log(groupId);
    });
    // module.exports = groupId; // export this variable so other files have access to it
});

function generateGroupIdPrepend(buttonNumber) { 
    if (buttonNumber === 1) {
        groupId = 'group01';
        addNewUser();
    } else {
        groupId = 'group02';
        addNewUser();
    }
};

function addNewUser() {
    var newUser = {
            'group_identifier': groupId,
            'errorButton': [],
            'thisIsGoodButton': [],
            'created_at': Date()
        }

    // db.collection.insert(newUser);

        // Use AJAX to post the object to our adduser service
        $.ajax({
            url: '',
            type: 'POST',
            data: {
            'group_identifier': groupId,
            'errorButton': [],
            'thisIsGoodButton': []
        }, // the JSON we created first in this function
            dataType: 'JSON'
        }).done(function( response ) {

            // Check for successful (blank) response
            if (response.msg === '') {

                console.log("success!");

            }
            else {

                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);

            }
        });
    
};

function getNextSequence(name) {
   var ret = db.counters.findAndModify(
          { 
            query: { _id: "incrementer" },
            update: { $inc: { seq: 1 } },
            new: true
          }
   );

   return ret.seq;
};

// Fill table with data
function getUserIdNumber() {

    // Empty content string
    var returnedData = '';

    // jQuery AJAX call for JSON. This asks the users.js route for the data:
    $.getJSON( '/users/userlist', function( data ) {

        // This variable is to store what our database returns. I'm not sure it's necessary because we're only going to be pulling
        // data for one document at a time.
        var userListData = data;

        // This is the data that will be displayed in the alert box when the study is over. 
        // TO DO: Find a way to get only THIS user's info, not ALL users' info.
        $.each(data, function(){
            returnedData += "Thanks! Now please fill out the survey. Your user reference is: " + this.unique_user_number;
        });

        // Inject the whole content string into our JS alert. This <div id="alertMessage"><p></p></div> will have to exist somewhere.
        $('#alertMessage p').html(returnedData);
    });
};

// Show User Info
function showUserInfo(event) {

    // Prevent Link from Firing
    event.preventDefault();

    // Retrieve username from link rel attribute
    var thisUserId = $(this).attr('rel');

    // Get Index of object based on id value
    var arrayPosition = returnedData.map(function(arrayItem) { return arrayItem.unique_user_number; });
    
    // Get our User Object
    var thisUserObject = userListData[arrayPosition];

    //Populate Info Box
    $('#userInfoName').text(thisUserObject.fullname);
    $('#userInfoAge').text(thisUserObject.age);
    $('#userInfoGender').text(thisUserObject.gender);
    $('#userInfoLocation').text(thisUserObject.location);

};

