var mongoose = require('mongoose');
var validators = require('mongoose-validators');
var Schema = mongoose.Schema;

var AppSchema = new Schema({
    experimentId: { type: Schema.Types.ObjectId, required: true },
    experimenterIds: { type: [String], required: true },
    applicationId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    type: { type: String, required: true },
    link: { type: String, required: true, validate: validators.isURL() },
    more: { type: {} }
});

module.exports = mongoose.model('Application', AppSchema);
