/* This is the JS that's served to every person who logs onto the site. */

$(document).ready(function() {
    var colourArray = [];
    var groupIdPrepend = '';
    $('#group01').on('click', enterGroup(1));
    $('#group02').on('click', enterGroup(2));
});

function generateGroupIdPrepend(buttonNumber) {
    if (buttonNumber === 1) {
        groupIdPrepend = 'group01_';
        addNewUser();
    } else {
        groupIdPrepend = 'group02_';
        addNewUser();
    }
};

function addNewUser() {
    event.preventDefault();
};
