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

app.server = 'http://parse.atx.hackreactor.com/chatterbox/classes/messages';

app.init = function() {
  this.friends = [];
  this.fetch();
};

app.send = function(message) {
  $.ajax({
    url: app.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
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
  var $message = $('<div><h4 class="username">' + message.username + '</h4>'
    + '<p>' + message.text + '</p></div>'
  );
  
  $('#chats').append($message);
};

app.renderRoom = function(room) {
  var $option = $('<option>' + room + '</option>');
  $('#roomSelect').append($option);
};

app.handleUsernameClick = function() {
  
    
};

app.handleSubmit = function() {
    
};

app.init();

$( document ).ready(function() {
  
  $('#roomSelect').change(function() {
    if ($(this).val() === 'createRoom') {
      var newRoom = prompt('Please name your new chatroom');
      app.renderRoom(newRoom);
      
    } else {
      var currentRoom = $(this).val();
      app.clearMessages();
      app.fetch(currentRoom);
    } 
  });
  
  $('#new-message-form').submit(function() {
    
  });
});

