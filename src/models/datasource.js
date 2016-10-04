var mongoose = require('mongoose');
var validators = require('mongoose-validators');
var Schema = mongoose.Schema;

var DataSourceSchema = new Schema({
    experimentId: { type: Schema.Types.ObjectId, required: true },
    experimenterIds: { type: [String], required: true },
    urns: [String]
});

module.exports = mongoose.model('DataSource', DataSourceSchema);
