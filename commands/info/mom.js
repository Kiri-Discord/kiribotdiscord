exports.run = async (client, message, args) => {
	message.channel.send(
		`.  。　　　since the beginning of time, there was **mommarosa**,•　    　ﾟ　　。
	　　      。。　.　　　　　。　　   。　.      。。　.　　　　　。　　   。　.	
		。。　.　　　　　。　　   。　.      。。　.　　　　　。　　   。　.	
		.　　　.　　the mother of all discord bots in the world.　  　　.　　　　　。　　   。　.
	
		but then,　.　　。。　　。　　   。　.    something happened.　    .    •
   
		•            . 　 。　.
		。。　.　　　　　。　　  *the end*　.　　　　　。　　   。　.	
		。。　.　　　　　。　　   。　.  。。　.　　　　　。　　   。　.
  　 　　。　　　　　　ﾟ　　　.　　　　　.
  ,　　　||*mom, you there? mom?..*||      。`, {files: [{ attachment: "https://i.imgur.com/JmoFRU7.jpeg", name: "SPOILER_help.jpeg"}]}

	)
},
  
exports.help = {
	name: "mom",
	description: "more info about my mom :)",
	usage: "mom",
	example: "mom"
};
  
exports.conf = {
	aliases: ["mom"],
	cooldown: 2
};
  
