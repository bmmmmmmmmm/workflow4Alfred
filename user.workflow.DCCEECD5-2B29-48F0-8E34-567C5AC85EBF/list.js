//公共引用
var fs = require('fs');
const public = require('./public.js');
const moment = require('moment');
moment.locale('zh-cn');

module.exports = function() {
    fs.readFile(public.currentFile(moment().format("YYYY-MM-DD")), { flag: 'r+', encoding: 'utf8' }, function (err, data) {
        if (err) {
            returnMsg('还没写日报哦');
            return;
        }
        var works = data.split(/\r?\n/g);
    
        var result_array = [];
        var full = '';
        var fullWithNum = '';
        var i = 1;
        for (let row of works[Symbol.iterator]()) {
            var rowArray = row.split(/\:\:/g);
            var time = '';
            var content = '';
            if (rowArray.length == 1) {
                content = row;
                time = '';
            } else {
                time = rowArray[0];
                content = rowArray[1];
            }
            if (content == '') {
                continue;
            }
            public.addRes(result_array, content, time);
            full += content + '\r\n';
            fullWithNum += i + ". " + content + "\r\n";
            i++;
        }

        function countWords(text) {
            /**
             * 截至 2023-10-14 日报计数规则如下：
             * 1. 字符不算
             * 2. 中文按字数计算
             * 3. 英文与数字混合计算，以空格分割
             */

            // 统计中文字数
            let chineseCount = 0;
            const chinesePattern = /[\u4e00-\u9fa5]/g;
            const chineseMatches = text.match(chinesePattern);
            if (chineseMatches) {
                chineseCount = chineseMatches.length;
            }

            // 统计英文与数字
            let englishCount = 0;
            const englishPattern = /[a-zA-Z0-9]+/g;
            const englishMatches = text.match(englishPattern);
            if (englishMatches) {
                englishCount = englishMatches.length;
            }
          
            return chineseCount + englishCount;
        }
    
        public.addResBefore(result_array, '复制日报（带序号）', `${countWords(fullWithNum)}字`, fullWithNum);
        public.addResBefore(result_array, '复制日报（不带序号）', `${countWords(full)}字`, full);
        console.log(JSON.stringify({
            items: result_array
        }));
    });
}

