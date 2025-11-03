// # 最长回文子串

// ## 问题描述

// 给定一个字符串 `s`，找到 `s` 中最长的回文子串。

// **回文串**是指正着读和反着读都一样的字符串。

// **例如：**
// ```
// 示例 1:
// 输入：s = "babad"
// 输出："bab" 或 "aba"
// 解释：两个都是有效答案

// 示例 2:
// 输入：s = "cbbd"
// 输出："bb"

// 示例 3:
// 输入：s = "a"
// 输出："a"
// 解释：单个字符本身就是回文串

// 示例 4:
// 输入：s = "ac"
// 输出："a" 或 "c"
// 解释：没有长度大于1的回文串
// ```


function huiwenzichuan (s) {
  const resultStr = '';
    for (let i = 0; i < s.length; i++) {
       for (let j = i; j < s.length; j++) {
         const str = s.substring(i, j + 1);
         let reverStr = str.split('').reverse().join('');
         if (str === reverStr) {
          if (resultStr.length < str.length) {
            resultStr = str;
          }
         }
       }
    }

  return resultStr;
}