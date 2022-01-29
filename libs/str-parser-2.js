(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.srtParser2 = factory());
})(this, (function () { 'use strict';

  class Parser {
      seperator = ",";
      correctFormat(time) {
          // Fix the format if the format is wrong
          // 00:00:28.9670 Become 00:00:28,967
          // 00:00:28.967  Become 00:00:28,967
          // 00:00:28.96   Become 00:00:28,960
          // 00:00:28.9    Become 00:00:28,900
          // 00:00:28,96   Become 00:00:28,960
          // 00:00:28,9    Become 00:00:28,900
          // 00:00:28,0    Become 00:00:28,000
          // 00:00:28,01   Become 00:00:28,010
          // 0:00:10,500   Become 00:00:10,500
          let str = time.replace(".", ",");
          var hour = null;
          var minute = null;
          var second = null;
          var millisecond = null;
          // Handle millisecond
          var [front, ms] = str.split(",");
          millisecond = this.fixed_str_digit(3, ms);
          // Handle hour
          var [a_hour, a_minute, a_second] = front.split(":");
          hour = this.fixed_str_digit(2, a_hour, false);
          minute = this.fixed_str_digit(2, a_minute, false);
          second = this.fixed_str_digit(2, a_second, false);
          return `${hour}:${minute}:${second},${millisecond}`;
      }
      /*
      // make sure string is 'how_many_digit' long
      // if str is shorter than how_many_digit, pad with 0
      // if str is longer than how_many_digit, slice from the beginning
      // Example:
    
      Input: fixed_str_digit(3, '100')
      Output: 100
      Explain: unchanged, because "100" is 3 digit
    
      Input: fixed_str_digit(3, '50')
      Output: 500
      Explain: pad end with 0
    
      Input: fixed_str_digit(3, '50', false)
      Output: 050
      Explain: pad start with 0
    
      Input: fixed_str_digit(3, '7771')
      Output: 777
      Explain: slice from beginning
      */
      fixed_str_digit(how_many_digit, str, padEnd = true) {
          if (str.length == how_many_digit) {
              return str;
          }
          if (str.length > how_many_digit) {
              return str.slice(0, how_many_digit);
          }
          if (str.length < how_many_digit) {
              if (padEnd) {
                  return str.padEnd(how_many_digit, "0");
              }
              else {
                  return str.padStart(how_many_digit, "0");
              }
          }
      }
      tryComma(data) {
          data = data.replace(/\r/g, "");
          var regex = /(\d+)\n(\d{1,2}:\d{2}:\d{2},\d{1,3}) --> (\d{1,2}:\d{2}:\d{2},\d{1,3})/g;
          let data_array = data.split(regex);
          data_array.shift(); // remove first '' in array
          return data_array;
      }
      tryDot(data) {
          data = data.replace(/\r/g, "");
          var regex = /(\d+)\n(\d{1,2}:\d{2}:\d{2}\.\d{1,3}) --> (\d{1,2}:\d{2}:\d{2}\.\d{1,3})/g;
          let data_array = data.split(regex);
          data_array.shift(); // remove first '' in array
          this.seperator = ".";
          return data_array;
      }
      fromSrt(data) {
          var originalData = data;
          var data_array = this.tryComma(originalData);
          if (data_array.length == 0) {
              data_array = this.tryDot(originalData);
          }
          var items = [];
          for (var i = 0; i < data_array.length; i += 4) {
              var new_line = {
                  id: data_array[i].trim(),
                  startTime: this.correctFormat(data_array[i + 1].trim()),
                  endTime: this.correctFormat(data_array[i + 2].trim()),
                  text: data_array[i + 3].trim()
              };
              items.push(new_line);
          }
          return items;
      }
      toSrt(data) {
          var res = "";
          for (var i = 0; i < data.length; i++) {
              var s = data[i];
              res += s.id + "\r\n";
              res += s.startTime + " --> " + s.endTime + "\r\n";
              res += s.text.replace("\n", "\r\n") + "\r\n\r\n";
          }
          return res;
      }
  }

  return Parser;

}));
