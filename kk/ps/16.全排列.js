// # 全排列

// ## 问题描述

// 给定一个不含重复数字的数组 `nums`，返回其**所有可能的全排列**。

// **排列**是指从 n 个不同元素中取出全部元素，按照一定的顺序排列。全排列是排列总数等于 n!。

// **例如：**
// ```
// 示例 1:
// 输入：nums = [1, 2, 3]
// 输出：[[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]

// 共 3! = 6 种排列

// 示例 2:
// 输入：nums = [0, 1]
// 输出：[[0, 1], [1, 0]]

// 共 2! = 2 种排列

// 示例 3:
// 输入：nums = [1]
// 输出：[[1]]

// 单个元素，只有 1 种排列
// ```

function quanpailie (nums) {
  if (nums.length === 0) {
    return [[]]
  }
  const res = [];
  for(let i = 0; i < nums.length; i++) {
    const cur = nums[i];
    const rest = nums.slice(0, i).concat(nums.slice(i + 1));
    for (const p of quanpailie(rest)){
      res.push([cur, ...p])
    }
  }
  return res;
}
