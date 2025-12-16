// # 计算字符串中的回文子串

// ## 问题描述

// 给定一个字符串 `s`，计算并返回**字符串中所有回文子串的数量**。

// **什么是回文？**
// ```
// 正着读和反着读都一样的字符串叫回文

// 例如：
//   "a"     ✓ 回文（只有一个字符）
//   "aa"    ✓ 回文（两个相同字符）
//   "aba"   ✓ 回文（中间是'b'，两边都是'a'）
//   "abba"  ✓ 回文（反着读也是"abba"）
//   "abc"   ✗ 不是回文（反着读是"cba"）
//   "abcd"  ✗ 不是回文
// ```

// **例如：**
// - 字符串：`"abc"` → 回文子串有 `"a"`, `"b"`, `"c"`，共3个
// - 字符串：`"aba"` → 回文子串有 `"a"`, `"b"`, `"a"`, `"aba"`，共4个
// - 字符串：`"aaa"` → 回文子串有 `"a"`, `"a"`, `"a"`, `"aa"`, `"aa"`, `"aaa"`，共6个

// **注意：**
// - 回文子串必须是**连续的**
// - 单个字符也算回文
// - 计算的是**数量**，不是找出所有回文

// ---

function countPalindromesBruteForce(s) {
    const result = [];
    for (let i = 0; i < s.length; i++) {
        let str = '';
        for (let j = i; j < s.length; j++) {
            str = s.substring(i, j + 1);
            if (str === str.split('').reverse().join('')) {
                result.push(str)
            }
        }
    }

    return result.length;
}