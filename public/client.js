$(document).ready(function () {
   /*global io*/
let socket = io();
// Form submittion with new message in field with id 'm'
$('form').submit(function () {
let messageToSend = $('#m').val();
//send message to server here?
socket.emit('chat message', messageToSend);
$('#m').val('');
return false; // prevent form submit from refreshing page
});

//my client listening for the following event ==> io.emit('user count', currentUsers)
socket.on('user', function(data){
 //$('#m').val(data); 
 // console.log(data);
  $('#num-users').text(data.currentUsers + ' users online');
  let message = data.name + (data.connected ? ' has joined the chat': ' has left the chat');
  $('#messages').append($('<li>').html('<b>'+message+'</b>'))
})
  
socket.on('chat message', (data)=>{
   $('#messages').append($('<li>').html(data.name + ' : '+ data.message))      
          })  
  
  
});
