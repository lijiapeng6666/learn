// # 给定一个数组和一个数，返回所有满足子数组和为给定数的子数组

// ## 问题描述

// 给定一个数组 `nums` 和一个目标和 `target`，找出数组中所有连续子数组，其元素总和等于目标和。

// **例如：**
// - 数组：`[1, 2, 3, 2, 1]`，target = 3 → 答案是 `[[3], [1, 2], [2, 1]]`
// - 数组：`[1, 1, 1, 1]`，target = 2 → 答案是 `[[1, 1], [1, 1], [1, 1]]`（3个）

// ---

function findSubarraysByBruteForce(nums, target) {
    const result = [];
    for (let i = 0; i < nums.length; i++) {
        let sum = 0;
        for (let j = i; j < nums.length; j++) {
            sum = sum + nums[j];
            if (sum === target) {
                result.push(nums.slice(i, j + 1));
            }
        }
    }
    return result;
}