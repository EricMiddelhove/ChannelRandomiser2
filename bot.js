'use strict';


const { exec } = require('child_process');
const { Console } = require('console');
/**
 * A ping pong bot, whenever you send "ping", it replies "pong".
 */

// Import the discord.js module
const Discord = require('discord.js');

// Create an instance of a Discord client
const client = new Discord.Client();
const TOKEN = require('./token.js')

//Public variables
var sessionMembers = []

//RANDOMISING VARIABLES
//This array will contain as many arrays as people should be in one channel. 
//Imagine the Arrays next to each other. The people will get matched after lines, every line is one group
var randomiseMap = [];
let randomiseOffset = 0;
var amountOfPeopleInOneChannel = 0;

/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
client.on('ready', () => {
  console.log('started ...');
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
            console.log("I got pinged at by " + member.displayName)
        }else if(cmd === 'whoAmI') {
            var username = member.user.username;

            if(username === "Vubito32"){
                channel.send("You are Vubito32! My master ... How might I help you? <3");
            }else{
                channel.send("You are " + username + "! U fucker!");
            }
            console.log("I told " + member.displayName + " who they are")
        }else if(cmd === "randomise" || cmd === "randomize"){

            if(args[0] == "session"){
                let errorMsg = ""
                let wrongSyntaxFlag = false
                if (args[1] == undefined || typeof Number(args[1]) != 'number'){
                    errorMsg += "The syntax for this command is '#" + cmd + " session <number of people in one channel'\n"
                    wrongSyntaxFlag = true
                }
                if(sessionMembers.length == 0){
                    errorMsg += "You need to create a session first\n"
                    wrongSyntaxFlag = true
                }else if(args[1] > sessionMembers.length){
                    errorMsg += "The number is too big. There are not enough people in your session\n"
                    wrongSyntaxFlag = true
                }

                if (wrongSyntaxFlag){
                    message.channel.send(errorMsg)
                    return;
                }

                randomiseSession(member, args, message);

            }else if (args[0] == "next"){
                //CODE HERE
                randomiseOffset = Number(randomiseOffset) + 1
                randomiseSession(member, args, message, randomiseOffset)
            }else{
                message.channel.send("This command does not exist. Please user '#randomise session <>'")
            }

        }else if(cmd === "pullAll"){
            console.log(member.displayName + " pulled everyone to their channel")
            pullAll(args, message.member)

        }else if(cmd === "session"){
            if(args[0] == "create"){

                sessionMembers = getAllMembersFromMyChannel(member.voice.channel, message);
                message.channel.send("Created a session with " + sessionMembers.length + " members")
                console.log(member.displayName + " created a sesson with " + sessionMembers.length + " member(s)")

            }else if(args[0] == "delete"){

                sessionMembers = []
                message.channel.send("Deleted the session")
                console.log(member.displayName + " deleted the session")

            }else if(args[0] == "add"){

                let membersFromMyChannel = getAllMembersFromMyChannel(member.voice.channel, message)
                //filtering me out of that session and adding them to the session members
                addToSession(membersFromMyChannel, member)
                message.channel.send("The size of the session is now " + sessionMembers.length)
                console.log(member.displayName + " added person(s) to the session. The size is now " + sessionMembers.length)

            }else if (args[0] == "remove"){
                
                let arg = args[1]

                let wrongConfiguration = false;
                let errorMsg = ""
                if (sessionMembers.length == 0){
                    errorMsg += "You have to create a session first \n"
                    wrongConfiguration = true;                }
                if (arg == undefined) {
                    errorMsg += "The syntax for this command is '#session remove <displayName of person to remove>' \n"
                    wrongConfiguration = true;
                }

                if (wrongConfiguration){
                    message.channel.send(errorMsg)
                    return;
                } 

                removeFromSession(arg)

                message.channel.send("The size of the session is now " + sessionMembers.length)
                console.log(member.displayName + " removed a person from the session. The size is now + " + sessionMembers.length)

            }else if(args[0] == "list"){

                if(sessionMembers.length <= 0){
                    message.channel.send("Your session is empty")
                    return
                }

                let listOfMembers = "The session contains following people: \n"

                for(var i = 0; i < sessionMembers.length; i++){

                    listOfMembers += (" - " + sessionMembers[i].displayName + "\n");

                }

                message.channel.send(listOfMembers)
                console.log(member.displayName + " requested a member list. The session contains " + sessionMembers.length + " members")
                console.log(listOfMembers)

            }else if(args[0] == "assignRole"){
                var errorMsg = ""
                var wrongSyntaxFlag = false;

                if(sessionMembers.length <= 0){
                    wrongSyntaxFlag = true
                    errorMsg += "You need to create a session first"
                }
                
                if(wrongSyntaxFlag){
                    message.channel.send(errorMsg);
                    return;
                }


                assignEventRole(member)
                message.channel.send("Assigned the role 'Event' to everyone in the session");
                console.log(member.displayName + " assigned the role 'Event' to everyone in the session")

            }
        }else if(cmd === "shutdown"){
            if (member.user.tag == "Vubito32#0018" || member.user.tag == "Brenden#0195" || member.user.tag == "Luca M. Roth#0093"){
                message.channel.send("Shutting down ...")
                exec('shutdown now',function callback(error, stdout, stderr){

                });
            }else{
                message.channel.send("Permission denied!")
            }
        }
    }
});

//DEPRECATED
function randomise(member, args, message){
    
    var membersArray = getAllMembersFromMyChannel(member.voice.channel)

    //Creating actual working array, inside the parent array in order iterate easier through them
    var amountOfPeopleInOneChannel = args[0]

    //Calculating how many people should be in one channel
    var amountOfPeopleInOneArray = Math.floor((membersArray.length) / amountOfPeopleInOneChannel);

    //Splitting up into amountOfPeopleInOneChannel arrays

    //Creating three arrays with people inside
    for(var i = 0; i < amountOfPeopleInOneChannel; i++){
        var arr = []
        for(var j = i; j < membersArray.length; j = parseInt(j) + parseInt(amountOfPeopleInOneChannel)){
            arr.push(membersArray[j]);
        }
        randomiseMap.push(arr)
    }

    //Getting available channels
    var channels = member.voice.guild.channels.cache
    var voiceChannels = [];

    //Sorting out voice channels
    channels.forEach(function(item, index){
       if(item.type == 'voice' && item.id != item.guild.afkChannelID && item.name != "Cinema"){
           voiceChannels.push(item)
       }
    })

    //Moving the people in the correct channels
    for(var i = 0; i < randomiseMap[0].length; i++){
        for(var j = 0; j < randomiseMap.length; j++){
            var memb = randomiseMap[j][i]
            if(memb != undefined){
                memb.voice.setChannel(voiceChannels[i])
                console.log("moved " + memb.displayName + " to: " + voiceChannels[i].name)
                message.channel.send("moved " + memb.displayName + " to: " + voiceChannels[i].name)
            }
        }
    }
}

function randomiseSession(member, args, message, offset = 0){
    var membersArray = sessionMembers

    //This array will contain as many arrays as people should be in one channel. 
    //Imagine the Arrays next to each other. The people will get matched after lines, every line is one group
    //var randomiseMap = [];

    //Creating actual working array, inside the parent array in order iterate easier through them
    amountOfPeopleInOneChannel = args[1]

    //Calculating how many people should be in one channel
    var amountOfPeopleInOneArray = Math.floor((membersArray.length) / amountOfPeopleInOneChannel);

    //Splitting up into amountOfPeopleInOneChannel arrays

    //Creating three arrays with people inside
    for(var i = 0; i < amountOfPeopleInOneChannel; i++){
        var arr = []
        for(var j = i; j < membersArray.length; j = parseInt(j) + parseInt(amountOfPeopleInOneChannel)){
            arr.push(membersArray[j]);
        }
        randomiseMap.push(arr)
    }


    //Getting available channels
    var channels = member.voice.guild.channels.cache
    var voiceChannels = [];

    //Sorting out voice channels
    channels.forEach(function(item, index){
       if(item.type == 'voice' && item.id != item.guild.afkChannelID && item.name != "Cinema"){
           voiceChannels.push(item)
       }
    })

    //Moving the people in the correct channels
    //console.log(voiceChannels)
    //THIS WORKS DO NOT TOUCH THIS
    let logMsg = ""
    for(var i = 0; i < randomiseMap[0].length; i++){
        for(var j = 0; j < randomiseMap.length; j++){
            let ii =  (i + (offset*j)) % randomiseMap[0].length;
            var memb = randomiseMap[j][ii]
            if(memb != undefined && memb.voice.channel != undefined){
                memb.voice.setChannel(voiceChannels[i])
                //console.log("moved " + memb.displayName + " to: " + voiceChannels[i].name)
                logMsg += "moved " + memb.displayName + " to: " + voiceChannels[i].name + "\n"
            }else if(memb != undefined){
                logMsg += "did not found " + memb.displayName + "\n"
            }else{
                logMsg += "unknown member\n"
            }
        }
    }

    message.channel.send(logMsg)
    console.log(logMsg)
}

//IN CREATION
function pullAll(args,member){
    var myChannel = member.voice.channel

    for(var i = 0; i < sessionMembers.length; i++){
        sessionMembers[i].voice.setChannel(myChannel);
    }
}

function removeFromSession(arg){
    let displayNameToDelete = ""
    for(var i = 0; i < arg.length; i++){
        if(arg[i] == "_"){
            displayNameToDelete += " "
        }else{
            displayNameToDelete += arg[i]
        }
    }

    let newSessionMembers = []
    for(var i = 0; i < sessionMembers.length; i++){
        if (sessionMembers[i].displayName != displayNameToDelete) {
            newSessionMembers.push(sessionMembers[i])
        }
    }
    sessionMembers = newSessionMembers;

}

function addToSession(membersToAdd, me){
    for(var i = 0; i < membersToAdd.length; i++){
        if(me.user.id != membersToAdd[i].user.id){
            sessionMembers.push(membersToAdd[i])
        }
    }
}

function getAllMembersFromMyChannel(vChannel, message){

    if(vChannel == undefined){
        message.channel.send("You need to be in a voice channel to do that")
        return
    }
    //Converting Members ID,Object Map to Object Array

    //------- Assigning all Members in this channel ----
    var members = vChannel.members;

    //console.log(members)
    var membersArray = [];
    members.forEach(function(item, index){

        membersArray.push(item)

    })

    return membersArray
}

function assignEventRole(member){
    var allGuildRoles = member.guild.roles.cache
    var eventRole = ""

    allGuildRoles.forEach(function(item, index){
        if(item.name == "Event"){
            eventRole = item;
            return;
        } 
    })

    for(var i = 0; i < sessionMembers.length; i++){
        sessionMembers[i].roles.add(eventRole,["Welcome to the current Mixer event!"]);
    }
}
// Log our bot in using the token from https://discord.com/developers/applications
client.login(TOKEN.token);