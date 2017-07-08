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
app.username = '';
app.server = 'http://parse.atx.hackreactor.com/chatterbox/classes/messages';

app.init = function() {
  app.username = window.location.href.split('=')[1];
  // this.friends = [];
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
  app.clearMessages();
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
  var isFriend = '';
  if (app.friends.includes(message.username)) {
    isFriend = ' friend';
    console.log(isFriend);
  }
  
  var $messageDiv;
  if (app.friends.includes(message.username)) {
    console.log('found friend');
    $messageDiv = $('<div class="message friend"></div>');
  } else {
    $messageDiv = $('<div class="message"></div>');
  }
  
  var $user = '<h4 class="username">' + message.username + '</h4>';
  var $messageText = '<p>' + message.text + '</p>';
  
  $messageDiv.html($user + $messageText);
  
  
  
  // var $message = $('<div class="message' + isFriend + '"><h4 class="username" value="' + message.username + '">' + message.username + '</h4>'
  //   + '<p>' + message.text + '</p></div>'
  // );
  
  
  $('#chats').append($messageDiv);
};

app.renderRoom = function(room) {
  var $option = $('<option>' + room + '</option>');
  $('#roomSelect').append($option);
};

app.handleUsernameClick = function(element) {
  var friend = element.text();
  app.friends.push(friend);
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

app.init();

$( document ).ready(function() {
  
  $('#roomSelect').change(function() {
    if ($(this).val() === 'createRoom') {
      var newRoom = prompt('Please name your new chatroom');
      app.renderRoom(newRoom);
      
    } else {
      app.currentRoom = $(this).val();
      app.fetch(app.currentRoom);
    } 
  });
  
  $('.submit').on('click', function(event) {
    event.preventDefault();
    app.handleSubmit($('#message').val());
    // var messageText = $('#new-message-text').val();
    // var message = {
    //   username: app.username,
    //   text: messageText,
    //   roomname: app.currentRoom
    // };
    // app.send(message);
    
  });
    
  $('#chats').on('click', '.username', function(event) {
    app.handleUsernameClick($(this));
  });
});

