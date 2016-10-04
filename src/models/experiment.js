var mongoose = require('mongoose');
var validators = require('mongoose-validators');
var Schema = mongoose.Schema;

var AreaSchema = new Schema({
    name: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    min: { type: Number },
    max: { type: Number },
    weight: { type: String },
    coordinates: {
        type: [
            [Number]
        ],
        required: true
    }
});


 var ClientInfoSchema = new Schema({
     client_id: { type: String },
     client_secret: { type: String },
     redirect_uris: { type: [String]},
     registration_client_uri: {type: String},
     registration_access_token: {type: String},
 });

var ExperimentSchema = new Schema({
    mainExperimenterId: { type: String, required: true },
    experimenterIds: { type: [String], required: true },
    experimentId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    registered: { type: Date, default: Date.now },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['running', 'stopped'], default: 'stopped' },
    description: { type: String, default: "" },
    logo: { type: String, default: "" },
    quota: {type: Number, required:true, default: 1000},
    remQuota: {type: Number, required: true, default: 1000},
    area: { type: [AreaSchema], default: [] },
    assetsPublic: {type: Boolean, default: true },
    clientInfo: {type: ClientInfoSchema}
});
module.exports = mongoose.model('Experiment', ExperimentSchema);
