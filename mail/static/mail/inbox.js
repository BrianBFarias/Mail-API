document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  addEventListener('submit', (e) => {
    // e.preventDefault();
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
    });
      // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  })

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#full-email').style.display = 'none';
  document.querySelector('#reply-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#top-title').innerHTML = 'New Email';
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function new_reply(email){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#full-email').style.display = 'none';
  document.querySelector('#reply-view').style.display = 'block';

  // fill in composition fields
  document.querySelector('#reply-title').innerHTML = `Replying to ${email.sender}`;
  if(email.subject.substring(0,3) === 'Re:'){
    document.querySelector('#reply-subject').value = `${email.subject}`;
  }
  else{
    document.querySelector('#reply-subject').value = `Re: ${email.subject}`;
  }

  document.querySelector('#reply-body').value = `On ${email.timestamp}  ${email.sender}  wrote: '${email.body}' \n`;

  addEventListener('submit', (e) => {
    // e.preventDefault();
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: email.sender,
          subject: document.querySelector('#reply-subject').value,
          body: document.querySelector('#reply-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
    });
  })

}

function email_read(email){
  fetch(`/emails/${email}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#full-email').style.display = 'none';
  document.querySelector('#reply-view').style.display = 'none';

  // Show the mailbox name
  if(mailbox === 'inbox'){
    fetch('/emails/inbox')
    .then(response => response.json())
    .then(emails => {
      // Print emails
  
      document.querySelector('#emails-view').innerHTML='';
      var title = document.createElement('h3');
      title.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
      document.querySelector('#emails-view').append(title);

      emails.forEach(function (email) {
        var element = document.createElement('button');
        if(email.read === true){
          element.className = "email-read";
        }else{
          element.className = "email-not-read";
        }
        element.onclick = function () {
          email_read(email.id);
          load_email(email.id);
        };
        element.innerHTML = `<strong>${email.subject}</strong> <h4>From:  ${email.sender}</h4> <p>${email.body}</p>`;
        document.querySelector('#emails-view').append(element);
      });
  
      // ... do something else with emails ...
    });
  }
  else if(mailbox === 'sent'){
    fetch('/emails/sent')
    .then(response => response.json())
    .then(emails => {
      // Print emails
      console.log(emails);
  
      document.querySelector('#emails-view').innerHTML='';
      var title = document.createElement('h3');
      title.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
      document.querySelector('#emails-view').append(title);

      emails.forEach(function (email) {
        var element = document.createElement('button');
        element.className = "email-read";
        element.onclick = function () {
          load_email(email.id);
        };
        element.innerHTML = `<strong>${email.subject}</strong> <h4>From:  ${email.sender}</h4> <p>${email.body}</p>`;
        document.querySelector('#emails-view').append(element);
      });
  
    });
  }
  else{
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#full-email').style.display = 'none';
    document.querySelector('#reply-view').style.display = 'none';

    document.querySelector('#emails-view').innerHTML='';
    var title = document.createElement('h3');
    title.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
    document.querySelector('#emails-view').append(title);

    fetch('/emails/archive')
    .then(response => response.json())
    .then(emails => {
        // Print emails
        console.log(emails);
    
        emails.forEach(function (email) {
          var element = document.createElement('button');
          element.onclick = function () {
            load_email(email.id);
          };
          element.innerHTML = `<strong>${email.subject}</strong> <h4>From:  ${email.sender}</h4> <p>${email.body}</p>`;
          document.querySelector('#emails-view').append(element);
        });
    });

  }

}

function archive_email(email, status){
  fetch(`/emails/${email}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: !status
    })
  })
}

function load_email(email){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#full-email').style.display = 'block';
  document.querySelector('#reply-view').style.display = 'none';

  let status;

  fetch(`/emails/${email}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);
    // ... do something else with email ...

    var reply = document.querySelector('.reply')
    var archive = document.querySelector('.archive')

    archive.className = 'archive';
    reply.className = 'reply';

    reply.innerHTML = `Reply`;

    reply.onclick = function () {
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'block';
      document.querySelector('#full-email').style.display = 'none';
      document.querySelector('#reply-view').style.display = 'none';
      new_reply(email);
    };


    if(email.archived === true){
      archive.innerHTML = `Unarchive`;
      status = false;
    }
    else{
      archive.innerHTML = `Archive`;
      status = true;
    }

    archive.onclick = function () {
      if(status){
        archive.innerHTML = `Unarchive`;
        status = false;
      }
      else{
        archive.innerHTML = `Archive`;
        status = true;
      }

      archive_email(email.id, status);

    };

    document.querySelector('#view-recipients').value = email.recipients;
    document.querySelector('#view-sender').value = email.sender;
    document.querySelector('#view-subject').value = email.subject;
    document.querySelector('#view-body').value = email.body;
    document.querySelector('#timestamp').innerHTML = `sent on <strong>${email.timestamp} </strong>`;
    document.querySelector('#full-email').append(reply);
    document.querySelector('#full-email').append(archive);
  });
}
