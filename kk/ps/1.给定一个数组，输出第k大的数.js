// # 给定一个数组，输出第k大的数

// ## 问题描述
// 给定一个数组和整数 k，找出数组中第 k 大的元素。

// **例如：**
// - 数组：`[3, 2, 1, 5, 6, 4]`，k = 2 → 答案是 5（第2大）
// - 数组：`[3, 2, 3, 1, 2, 4, 5, 5, 6]`，k = 4 → 答案是 4（第4大）

// ---

function KSum(arr, k) {
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        result.push(arr[i]);
        if (result.length === k) {
            result.sort((a, b) => a - b);
            result.shift();
        }
    }
    return Math.min(...result);
}