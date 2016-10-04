var nodemailer = require("nodemailer");
var EmailTemplates = require('email-templates').EmailTemplate;
var path = require('path')
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "luisfc1984@gmail.com",
        pass: "72064846"
    }
});

var templatesDir = path.join(__dirname, '..', 'templates');
var template = new EmailTemplates(path.join(templatesDir, 'participant-invitation'));

function sendInvitations (emails, name, description, cb) {
    
    var user = {
        name: name,
        description: description
    };

    template.render(user, function (err, results) {
        if (err) {
            console.log(err)    
        }
        var mailOptions = {
            from: "Organicity no-reply <no-reply@organicity.eu>", // sender address
            to: emails, // list of receivers
            subject: "Invitation to experiment", // Subject line
            text: results.text,
            html: results.html
        }

        smtpTransport.sendMail(mailOptions, function(error, response){
            if(error){
              return cb(null)
            } else {
              return cb(response.message);
            }
      });
    }) 

}

module.exports = {
	sendInvitations: sendInvitations
}