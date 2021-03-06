// http://parse.atx.hackreactor.com/chatterbox/classes/messages
// display messages
// refresh messages (automatic or triggered) 
// some way for users to set their username and to send messages using that name
// filter messages based on .roomname
// should be able to add friends by clicking on their names
  // those friends' messages should show up in bold
// http://parse.atx.hackreactor.com/chatterbox/classes/messages

var app = {};

app.friends = [];
app.rooms = [];
app.currentRoom = 'lobby';
app.username = 'anonymous';
app.server = 'http://parse.atx.hackreactor.com/chatterbox/classes/messages';

app.init = function() {
  if (window.location.href.split('html')[1]) {
    app.username = window.location.href.split('=')[1].split('%20').join(' ');  
  }
  
  this.fetch();
};

app.send = function(message) {
  $.ajax({
    url: app.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('data:', data);
      console.log(message);
      var $message = $('<div><h4 class="username">' + message.username + '</h4>'
        + '<p>' + message.text + '</p></div>'
      );
  
      $('#chats').prepend($message);
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.fetch = function(room = 'lobby') {
  var messages = [];
  
  $.ajax({
    url: app.server,
    type: 'GET',
    contentType: 'application/json',
    data: {'order': '-createdAt'},
    success: function(data) {
      messages = data.results;
      for (message of messages) {
        if (!app.rooms.includes(message.roomname)) {
          app.rooms.push(message.roomname);
          app.renderRoom(message.roomname);
        }
        if (message.roomname === room) {
          app.renderMessage(message);
        }
      }
      console.log('Messages retrieved from Parse server');
    },
    error: function(data) {
      console.error('Failed to retrieve messages from Parse server', data);
    }
  });
  
};

app.clearMessages = function() {
  $('#chats').empty();
};

app.renderMessage = function(message) {
  message.username = app.sanitizeInput(message.username);
  message.text = app.sanitizeInput(message.text);
  
  var isFriend = '';
  if (app.friends.includes(message.username)) {
    isFriend = ' friend';
    console.log(isFriend);
  }
  
  var $messageDiv;
  if (app.friends.includes(message.username)) {
    $messageDiv = $('<div class="message friend"></div>');
  } else {
    $messageDiv = $('<div class="message"></div>');
  }
  
  var $user = '<h4 class="username">' + message.username + '</h4>';
  var $messageText = '<p>' + message.text + '</p>';
  
  $messageDiv.html($user + $messageText);
  
  $('#chats').append($messageDiv);
};

// tagBody, tagOrComment, and removeTags taken from
// https://stackoverflow.com/a/430240
app.sanitizeInput = function(input) {
  var tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';

  var tagOrComment = new RegExp(
    '<(?:'
    // Comment body.
    + '!--(?:(?:-*[^->])*--+|-?)'
    // Special "raw text" elements whose content should be elided.
    + '|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*'
    + '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*'
    // Regular name
    + '|/?[a-z]'
    + tagBody
    + ')>',
    'gi'
  );
  
  var removeTags = function (html) {
    var oldHtml;
    do {
      oldHtml = html;
      html = html.replace(tagOrComment, '');
    } while (html !== oldHtml);
    return html.replace(/</g, '&lt;');
  };
  
  if (!input) {
    return;
  }
  
  return removeTags(input);
};

app.renderRoom = function(room) {
  room = app.sanitizeInput(room);
  var $option = $('<option value="' + room + '">' + room + '</option>');
  $('#roomSelect').append($option);
  $('#roomSelect option[value="lobby"]').prop('selected', true);

};

app.handleUsernameClick = function(element) {
  var friend = element.text();
  app.friends.push(friend);
  app.clearMessages();
  app.fetch(app.currentRoom);
};

app.handleSubmit = function(messageText) {
  var message = {
    username: app.username,
    text: messageText,
    roomname: app.currentRoom
  };
  
  app.send(message);
};

app.renderCurrentRoom = function(room) {
  $('#roomSelect option[value="' + room + '"]').prop('selected', true);
  app.clearMessages();
  app.fetch(app.currentRoom);
};

$( document ).ready(function() {
  
  $('#roomSelect').change(function() {
    if ($(this).val() === 'createRoom') {
      var newRoom = prompt('Please name your new chatroom');
      app.currentRoom = newRoom;
      app.renderRoom(newRoom);
      app.rooms.push(newRoom);
    } else {
      app.currentRoom = $(this).val();
    } 
    app.renderCurrentRoom(app.currentRoom);
  });
  
  $('#send').submit(function(event) {
    event.preventDefault();
    app.handleSubmit($('#message').val());
  });
    
  $('#chats').on('click', '.username', function(event) {
    app.handleUsernameClick($(this));
  });
});

