var debugLevel = 'info';
var moment = require('moment');

module.exports = {
	setLevel : function(level){
		debugLevel = level;
	},
	log:function (level, message){

	    var levels = ['error', 'warn', 'info'];
	    if (levels.indexOf(level) <= levels.indexOf(debugLevel) ) {
	      if (typeof message !== 'string') {
	        message = JSON.stringify(message);
	      };
	      var time = moment().format('YYYY.MM.DD - HH:mm:ss:SSS');
	      console.log(time + ': ' + level + ' - ' + message);
	    };
	}
};