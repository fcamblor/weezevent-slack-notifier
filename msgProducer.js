var _ = require('lodash');

function SlackMessageProducer(){
};

function writeParticipants(participants) {
    return _.map(participants, function(participant){
        return participant.first_name+" "+participant.last_name+(participant.company?" ("+participant.company+")":"");
    }).join(", ");
};

SlackMessageProducer.prototype.produceMessageFrom = function(persistedParticipants, updatedBdxioParticipants){
    var thresholdDate = persistedParticipants.latest_creation?Date.parse(persistedParticipants.latest_creation):0;

    var newParticipantsByTicket = _(updatedBdxioParticipants)
        // First, filtering every fetched participants already present in persisted participants
        .filter(function(bdxioParticipant){
            return Date.parse(bdxioParticipant.create_date) > thresholdDate;
            // Grouping by ticket type
        }).groupBy('ticket').value();

    var msg = ':tada:',
        ticketTypes = _.keys(newParticipantsByTicket),
        newParticipantsCount = _(newParticipantsByTicket).values().flatten().value().length,
        plural = newParticipantsCount>=2;

    if(ticketTypes.length === 0) {
        return null;
    } else if(ticketTypes.length === 1) {
        msg += newParticipantsCount+" place"+(plural?"s":"")+" de type "+ticketTypes[0]+" "+(plural?"viennent":"vient")+" d'être vendue"+(plural?"s":"")+" : "+writeParticipants(newParticipantsByTicket[ticketTypes[0]]);
    } else {
        msg += newParticipantsCount+" place"+(plural?"s viennent":" vient")+" d'être vendue"+(plural?"s":"")+" répartie"+(plural?"s":"")+" comme suit :\n";
        msg += _.reduce(newParticipantsByTicket, function(result, value, key) {
            var plural = value.length>=2;
            result += "- "+value.length+" place"+(plural?"s":"")+" "+key+" : "+writeParticipants(value)+"\n";
            newParticipantsCount += value.length;
            return result;
        }, "");
    }

    if(newParticipantsCount === 0) {
        return null;
    }

    return msg+"\n:tada::tada::tada:";
};

SlackMessageProducer.prototype.convertWZParticipantsToBDXIOParticipants = function(wzParticipants, wzTickets) {
    var ticketsById = _.keyBy(wzTickets, 'id');

    return _(wzParticipants)
        .map(function(wzParticipant) {
            return {
                id: wzParticipant.id_participant,
                ticket: ticketsById[wzParticipant.id_ticket].name,
                deleted: wzParticipant.deleted,
                refund: wzParticipant.refund,
                create_date: wzParticipant.create_date,
                paid: wzParticipant.paid,
                first_name: wzParticipant.owner.first_name,
                last_name: wzParticipant.owner.last_name,
                company: _.map(_.filter(wzParticipant.answers, function(answ){ return answ.label === 'Societe'; }), "value").join("")
            };
        }).sortBy('create_date').value();
};

module.exports = SlackMessageProducer;