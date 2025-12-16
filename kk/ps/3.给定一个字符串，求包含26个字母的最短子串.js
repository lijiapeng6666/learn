// # 给定一个字符串，求包含26个字母的最短子串

// ## ⚠️ 题意更正（你理解错了！）

// ### ❌ 错误的理解

// ```
// "长度就是26个字符"就够了？

// 错了！比如：
// 子串："abcaaaaaaaaaaaaaaaaaaaaaa"a
// 长度：26个字符
// 但它只包含 'a' 和 'b' 两种字母（不是26种！）
// ```

function twitySix(str) {
    let resStr = '';
    for (let i = 0; i < str.length; i++) {
        const arr = [];
        for (let j = i; j < str.length; j++) {
            if (!arr.includes(str[j])) {
                arr.push(str[j]);
            }
            if (arr.length === 26) {
                let tempStr = str.substring(i, j + 1)
                if (resStr !== '' && resStr.length > tempStr.length) {
                    resStr = tempStr;
                }
            }
        }
    }
    return resStr;
}