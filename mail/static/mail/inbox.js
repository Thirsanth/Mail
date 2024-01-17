document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);


  // email sent
  document.querySelector('#compose-form').addEventListener('submit',email_sent);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-details-view').style.display='none';



  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';


}

function view_email(id){
    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(viewmail => {
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#email-details-view').style.display='block';

      // document.querySelector('#email-details-view').innerHTML=`<div><h1>${viewmail.sender}</h1</div>`;
      console.log(viewmail);

      document.querySelector('#email-details-view').innerHTML=`<div>
      <h5><b>From:</b>${viewmail.sender}</h5>
      <h5><b>to:</b>${viewmail.recipients}</h5>
      <h5><b>date:</b>${viewmail.timestamp}</h5>
      <hr>
      <p>${viewmail.body}</p>
      </div>`


      //updating read status
      if(!viewmail.read){
        fetch(`/emails/${id}`,{
          method:'PUT',
          body: JSON.stringify({
            read:true
          })
        })
      }

      
      // Updating archive status
      const archive_btn=document.createElement('button');
      archive_btn.innerHTML=!viewmail.archived?'Archive':'Unarchive';
      archive_btn.className=!viewmail.archived?'btn btn-sm btn-outline-primary':'btn btn-sm btn-outline-danger';
      archive_btn.addEventListener('click',function(){
        fetch(`/emails/${viewmail.id}`,{
          method: 'PUT',
          body: JSON.stringify({
            archived:!viewmail.archived
          })
        })
        .then(()=>{
          load_mailbox('inbox')
        })
      });
     
      document.querySelector('#email-details-view').append(archive_btn);

      // Replying to email
      const reply_btn=document.createElement('button');
      reply_btn.innerHTML='Reply';
      reply_btn.className='btn btn-sm btn-outline-primary mx-1';
      reply_btn.addEventListener('click',function(){    
        compose_email();
        document.querySelector('#compose-recipients').value = viewmail.sender;
        let subject_re=viewmail.subject;
        if(subject_re.split(' ',1)[0] !='Re:'){
          subject_re= "Re: "+viewmail.subject
        }
        
        document.querySelector('#compose-subject').value = subject_re;
        document.querySelector('#compose-body').value = `on ${viewmail.timestamp} ${viewmail.sender} wrote: ${viewmail.body} `;
      });
      document.querySelector('#email-details-view').append(reply_btn);


    })

  
  
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-details-view').style.display='none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //content of mailbox
  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(emails =>{
    emails.forEach(singlemail => {
      const new_mail = document.createElement('div');
      new_mail.className="border border-primary-subtle";


    new_mail.innerHTML=`<div class="container text-center">
    <div class="row align-items-start">
      <div class="col my-3">
        ${singlemail.sender}
      </div>
      <div class="col my-3">
        ${singlemail.subject}
      </div>
      <div class="col my-3">
        ${singlemail.timestamp}
      </div>
    </div>
  </div>
  `
    // changing the back ground color of mail
    new_mail.className=singlemail.read?'read':'unread';

      new_mail.addEventListener('click', function() {
        view_email(`${singlemail.id}`)
    });
    document.querySelector('#emails-view').append(new_mail);
    });
    
  })
}

function email_sent(event){
  event.preventDefault();
  const recipients=document.querySelector('#compose-recipients').value;
  const subject=document.querySelector('#compose-subject').value;
  const body=document.querySelector('#compose-body').value;
  fetch('/emails',{
    method:'POST',
    body: JSON.stringify({
      recipients:recipients,
      subject:subject,
      body:body
    })
  })
  .then(response => response.json())
  .then(result =>{
    console.log(result);
    load_mailbox('sent');
  })
}