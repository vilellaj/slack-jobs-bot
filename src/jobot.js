'use strict';

const Bot = require('slackbots');
const request = require('superagent');

class Jobot extends Bot{

    constructor(settings)
    {
        super(settings);
        this.name = settings.name;
        this.user = null;

        //Register event handlers
        this.on('start', this.loadBotUser);
        this.on('message', this.messageHandler);
    }

    loadBotUser()
    {
        
        this.user = this.users.filter((user) => {
            return user.name === this.name;
        })[0];
    }

    messageHandler(message)
    {
        if(this.isChatMessage(message) 
        && this.isChannelConversation(message)
        && !this.isFromJobot(message)
        && this.isLookingForJob(message))
        {
            console.log('Aqui');
            this.lookForJob(message);
        }
    }

    isChannelConversation(message)
    {
        console.log(message.channel[0]);
        return typeof message.channel === 'string' &&
                message.channel[0] === 'C';
    }

    isChatMessage(message)
    {
        console.log('isChatMessage');
        return message.type == 'message' && Boolean(message.text);
    }

    isFromJobot(message)
    {
        console.log('isFromJobot');        
        return message.user === this.user.id;
    }

    isLookingForJob(message)
    {
        console.log('isLookingForJob');                
        return message.text.toLowerCase().indexOf('job') > -1 ;
    }

    lookForJob(message)
    {
        let searchTerm = message.text.split('job')[0];
        console.log(searchTerm);

        let url = 'https://jobs.github.com/positions.json?search=' + searchTerm;

        console.log('Cheguei aqui');


        request
            .get(url)
            .end((err, res) => {
                
                if(err)
                    throw err;
                
                var channel = this.getChannelById(message.channel);
                this.postMessageToChannel(channel.name, res, {as_user: true});

            });
    }

    getChannelById(channelId)
    {
        return this.channels.filter((item) => {
                return item.id === channelId;
            })[0];
    }
}

module.exports = Jobot;