'use strict';

const { Console } = require('console');
/**
 * A ping pong bot, whenever you send "ping", it replies "pong".
 */

// Import the discord.js module
const Discord = require('discord.js');

// Create an instance of a Discord client
const client = new Discord.Client();

/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
client.on('ready', () => {
  console.log('I am ready!');
});

// Create an event listener for messages
client.on('message', message => {
    // If the message is "ping"
    var messageString = message.content
    if (messageString.substring(0,1) == '#'){
        var channel = message.channel
        //Making the input message to an array of cmd and args, ignoring the cmd indicator symbol
        var arr =  messageString.substring(1).split(' ')

        //assigning the first sting of commands aas the comand
        var cmd = arr[0]
        //removeing the first item of the list
        arr.shift()
        //The rest of the array are the argumentss
        var args = arr
        var member = message.member

        if (cmd === 'ping') {
            // Send "pong" to the same channel
            channel.send('pong');
        }else if(cmd === 'whoAmI') {
            var username = member.user.username;
            console.log(member);

            if(username === "Vubito32"){
                channel.send("You are Vubito32! My master ... How might I help you? <3");
            }else{
                channel.send("You are " + username + "! U fucker!");
            }

        }else if(cmd === "randomise"){
            randomise(member, args);
        }else if(cmd === "randomize"){
            randomise(member, args);
        }
    }
});

function randomise(member, args){
    var channel = member.voice.channel
    //Converting Members ID,Object Map to Object Array
    var members = channel.members;

    //console.log(members)
    var membersArray = [];
    members.forEach(function(item, index){

        membersArray.push(item)

    })


    //This array will contain as many arrays as people should be in one channel. 
    //Imagine the Arrays next to each other. The people will get matched after lines, every line is one group
    var parentArray = [];

    //Creating actual working array, inside the parent array in order iterate easier through them
    var amountOfPeopleInOneChannel = args[0]

    //Calculating how many people should be in one channel
    var amountOfPeopleInOneArray = Math.floor((membersArray.length) / amountOfPeopleInOneChannel);

    //Splitting up into amountOfPeopleInOneChannel arrays

    //Creating three arrays with people inside
    for(var i = 0; i < amountOfPeopleInOneChannel; i++){

        var arr = []
        console.log("new group")
        for(var j = i; j < membersArray.length; j = parseInt(j) + parseInt(amountOfPeopleInOneChannel)){
            arr.push(membersArray[j]);
        }
        parentArray.push(arr)
    }

    //Getting available channels
    var channels = member.voice.guild.channels.cache
    var voiceChannels = [];

    //Sorting out voice channels
    channels.forEach(function(item, index){

       if(item.type == 'voice' && item.id != item.guild.afkChannelID){
           voiceChannels.push(item)
       }

    })

    console.log(voiceChannels)
    for(var i = 0; i < parentArray[0].length; i++){
        for(var j = 0; j < parentArray.length; j++){
            var memb = parentArray[j][i]
            console.log("--------------------\n" + memb)
            if(memb != undefined){
                memb.voice.setChannel(voiceChannels[i])
                console.log("moved " + memb.username + " to: " + voiceChannels[i].name)
            }
        }
    }


}

// Log our bot in using the token from https://discord.com/developers/applications
client.login('Nzc4ODA0MjQ5ODIzNDEyMjY1.X7XT-g.uqmb-NcgR7CBC4yTPOA3nkbVimk');