// 方法1: 暴力解法 - O(n²) 时间复杂度
function twoSum(nums, target) {
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) {
                return [i, j];  // 找到后立即返回
            }
        }
    }
    return [];  // 如果没找到,返回空数组
}

// 方法2: 哈希表优化 - O(n) 时间复杂度,O(n) 空间复杂度
function twoSumOptimized(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}

// 测试用例
console.log(twoSum([2, 7, 11, 15], 9));  // [0, 1]
console.log(twoSum([3, 2, 4], 6));       // [1, 2]
console.log(twoSum([3, 3], 6));          // [0, 1]

console.log('\n优化版本:');
console.log(twoSumOptimized([2, 7, 11, 15], 9));  // [0, 1]
console.log(twoSumOptimized([3, 2, 4], 6));       // [1, 2]
console.log(twoSumOptimized([3, 3], 6));          // [0, 1]