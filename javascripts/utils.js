// Generated by CoffeeScript 1.10.0
(function() {
  var Utils;

  Utils = (function() {
    Utils.prototype.N = 38;

    Utils.prototype.HOST = '127.0.0.1';

    Utils.prototype.MATCHMAKER_PORT = 9696;

    Utils.prototype.PLAYER_PORT = 6969;

    Utils.prototype.EPSILON = 0.000001;

    function Utils() {}

    Utils.prototype.toString = function() {
      return console.log("Utils tostring called");
    };

    Utils.prototype.numberOfDecimals = function(number) {
      number = number.toString();
      return (number.split('.')[1] || []).length;
    };

    Utils.prototype.convertStringToNumArray = function(numberString, decimalPoints) {
      var i, index, j, numberArray, ref, ref1, size, stringArray;
      if (decimalPoints == null) {
        decimalPoints = 0;
      }
      numberString = numberString.toString();
      numberArray = [];
      if (numberString) {
        stringArray = numberString.trim().split(" ");
        size = stringArray.length;
        if (decimalPoints === 0) {
          for (index = i = 0, ref = size - 1; 0 <= ref ? i <= ref : i >= ref; index = 0 <= ref ? ++i : --i) {
            numberArray.push(parseFloat(stringArray[index]));
          }
        } else {
          for (index = j = 0, ref1 = size - 1; 0 <= ref1 ? j <= ref1 : j >= ref1; index = 0 <= ref1 ? ++j : --j) {
            numberArray.push(parseFloat(stringArray[index]).toFixed(decimalPoints));
          }
        }
        return numberArray;
      } else {
        return console.log("We are splitting an undefined");
      }
    };

    Utils.prototype.convertNumArrayToFormattedString = function(numArray) {
      var i, len, num, returnString;
      returnString = "";
      for (i = 0, len = numArray.length; i < len; i++) {
        num = numArray[i];
        returnString += num + " ";
      }
      return returnString;
    };

    return Utils;

  })();

  module.exports = Utils;

}).call(this);
