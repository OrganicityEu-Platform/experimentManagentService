var mongoose = require('mongoose');
var validators = require('mongoose-validators');
var Schema = mongoose.Schema;

var InvitationSchema = new Schema({
	email: { type: String, required: true },
    experimentId: { type: Schema.Types.ObjectId, required: true },
    date:{ type: Date, default: Date.now },
    state: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    description: { type: String},
    name: { type: String},
});

module.exports = mongoose.model('Invitation', InvitationSchema);
