# 2025年JavaScript算法面试题清单

## 目录
- [数组操作](#数组操作)
- [字符串处理](#字符串处理)
- [链表操作](#链表操作)
- [树结构](#树结构)
- [动态规划](#动态规划)
- [排序算法](#排序算法)
- [搜索算法](#搜索算法)
- [数学算法](#数学算法)
- [图算法](#图算法)
- [设计模式](#设计模式)
- [异步编程](#异步编程)
- [性能优化](#性能优化)

---

## 数组操作

### 1. 两数之和
**题目：** 给定一个整数数组和一个目标值，找出数组中两个数的和等于目标值的索引。

```javascript
// 示例
// 输入：nums = [2,7,11,15], target = 9
// 输出：[0,1]

function twoSum(nums, target) {
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
```

### 2. 三数之和
**题目：** 找出数组中所有和为0的三元组。

```javascript
function threeSum(nums) {
    nums.sort((a, b) => a - b);
    const result = [];
    
    for (let i = 0; i < nums.length - 2; i++) {
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        
        let left = i + 1, right = nums.length - 1;
        while (left < right) {
            const sum = nums[i] + nums[left] + nums[right];
            if (sum === 0) {
                result.push([nums[i], nums[left], nums[right]]);
                while (left < right && nums[left] === nums[left + 1]) left++;
                while (left < right && nums[right] === nums[right - 1]) right--;
                left++;
                right--;
            } else if (sum < 0) {
                left++;
            } else {
                right--;
            }
        }
    }
    return result;
}
```

### 3. 最大子数组和
**题目：** 找到数组中连续子数组的最大和。

```javascript
function maxSubArray(nums) {
    let maxSum = nums[0];
    let currentSum = nums[0];
    
    for (let i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    
    return maxSum;
}
```

### 4. 旋转数组
**题目：** 将数组向右旋转k步。

```javascript
function rotate(nums, k) {
    k = k % nums.length;
    reverse(nums, 0, nums.length - 1);
    reverse(nums, 0, k - 1);
    reverse(nums, k, nums.length - 1);
}

function reverse(nums, start, end) {
    while (start < end) {
        [nums[start], nums[end]] = [nums[end], nums[start]];
        start++;
        end--;
    }
}
```

### 5. 合并两个有序数组
**题目：** 将两个有序数组合并为一个有序数组。

```javascript
function merge(nums1, m, nums2, n) {
    let i = m - 1, j = n - 1, k = m + n - 1;
    
    while (i >= 0 && j >= 0) {
        if (nums1[i] > nums2[j]) {
            nums1[k] = nums1[i];
            i--;
        } else {
            nums1[k] = nums2[j];
            j--;
        }
        k--;
    }
    
    while (j >= 0) {
        nums1[k] = nums2[j];
        j--;
        k--;
    }
}
```

---

## 字符串处理

### 6. 最长无重复字符子串
**题目：** 找到字符串中最长的不包含重复字符的子串。

```javascript
function lengthOfLongestSubstring(s) {
    const map = new Map();
    let maxLength = 0;
    let start = 0;
    
    for (let end = 0; end < s.length; end++) {
        if (map.has(s[end])) {
            start = Math.max(start, map.get(s[end]) + 1);
        }
        map.set(s[end], end);
        maxLength = Math.max(maxLength, end - start + 1);
    }
    
    return maxLength;
}
```

### 7. 有效的括号
**题目：** 判断字符串中的括号是否有效匹配。

```javascript
function isValid(s) {
    const stack = [];
    const map = {
        ')': '(',
        '}': '{',
        ']': '['
    };
    
    for (let char of s) {
        if (char in map) {
            if (stack.length === 0 || stack.pop() !== map[char]) {
                return false;
            }
        } else {
            stack.push(char);
        }
    }
    
    return stack.length === 0;
}
```

### 8. 字符串转整数
**题目：** 实现atoi函数，将字符串转换为整数。

```javascript
function myAtoi(s) {
    s = s.trim();
    if (!s) return 0;
    
    let sign = 1;
    let i = 0;
    
    if (s[0] === '+' || s[0] === '-') {
        sign = s[0] === '-' ? -1 : 1;
        i++;
    }
    
    let result = 0;
    while (i < s.length && /^\d$/.test(s[i])) {
        result = result * 10 + parseInt(s[i]);
        i++;
    }
    
    result *= sign;
    return Math.max(-Math.pow(2, 31), Math.min(Math.pow(2, 31) - 1, result));
}
```

### 9. 最长回文子串
**题目：** 找到字符串中最长的回文子串。

```javascript
function longestPalindrome(s) {
    if (!s || s.length < 1) return "";
    
    let start = 0, end = 0;
    
    for (let i = 0; i < s.length; i++) {
        const len1 = expandAroundCenter(s, i, i);
        const len2 = expandAroundCenter(s, i, i + 1);
        const len = Math.max(len1, len2);
        
        if (len > end - start) {
            start = i - Math.floor((len - 1) / 2);
            end = i + Math.floor(len / 2);
        }
    }
    
    return s.substring(start, end + 1);
}

function expandAroundCenter(s, left, right) {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
        left--;
        right++;
    }
    return right - left - 1;
}
```

---

## 链表操作

### 10. 反转链表
**题目：** 反转一个单链表。

```javascript
function reverseList(head) {
    let prev = null;
    let current = head;
    
    while (current) {
        const next = current.next;
        current.next = prev;
        prev = current;
        current = next;
    }
    
    return prev;
}
```

### 11. 合并两个有序链表
**题目：** 将两个升序链表合并为一个新的升序链表。

```javascript
function mergeTwoLists(l1, l2) {
    const dummy = new ListNode(0);
    let current = dummy;
    
    while (l1 && l2) {
        if (l1.val <= l2.val) {
            current.next = l1;
            l1 = l1.next;
        } else {
            current.next = l2;
            l2 = l2.next;
        }
        current = current.next;
    }
    
    current.next = l1 || l2;
    return dummy.next;
}
```

### 12. 链表中倒数第k个节点
**题目：** 找到链表中倒数第k个节点。

```javascript
function getKthFromEnd(head, k) {
    let fast = head;
    let slow = head;
    
    for (let i = 0; i < k; i++) {
        fast = fast.next;
    }
    
    while (fast) {
        fast = fast.next;
        slow = slow.next;
    }
    
    return slow;
}
```

### 13. 环形链表
**题目：** 判断链表中是否有环。

```javascript
function hasCycle(head) {
    if (!head || !head.next) return false;
    
    let slow = head;
    let fast = head.next;
    
    while (fast && fast.next) {
        if (slow === fast) return true;
        slow = slow.next;
        fast = fast.next.next;
    }
    
    return false;
}
```

---

## 树结构

### 14. 二叉树的最大深度
**题目：** 计算二叉树的最大深度。

```javascript
function maxDepth(root) {
    if (!root) return 0;
    
    const leftDepth = maxDepth(root.left);
    const rightDepth = maxDepth(root.right);
    
    return Math.max(leftDepth, rightDepth) + 1;
}
```

### 15. 验证二叉搜索树
**题目：** 验证一个二叉树是否为有效的二叉搜索树。

```javascript
function isValidBST(root) {
    return validate(root, -Infinity, Infinity);
}

function validate(node, min, max) {
    if (!node) return true;
    
    if (node.val <= min || node.val >= max) {
        return false;
    }
    
    return validate(node.left, min, node.val) && 
           validate(node.right, node.val, max);
}
```

### 16. 二叉树的层序遍历
**题目：** 按层遍历二叉树。

```javascript
function levelOrder(root) {
    if (!root) return [];
    
    const result = [];
    const queue = [root];
    
    while (queue.length > 0) {
        const levelSize = queue.length;
        const currentLevel = [];
        
        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift();
            currentLevel.push(node.val);
            
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        
        result.push(currentLevel);
    }
    
    return result;
}
```

### 17. 路径总和
**题目：** 判断二叉树中是否存在从根到叶子的路径，使得路径上所有节点值的和等于目标值。

```javascript
function hasPathSum(root, targetSum) {
    if (!root) return false;
    
    if (!root.left && !root.right) {
        return root.val === targetSum;
    }
    
    return hasPathSum(root.left, targetSum - root.val) ||
           hasPathSum(root.right, targetSum - root.val);
}
```

---

## 动态规划

### 18. 爬楼梯
**题目：** 每次可以爬1或2个台阶，有多少种方法爬到n阶。

```javascript
function climbStairs(n) {
    if (n <= 2) return n;
    
    let prev1 = 1, prev2 = 2;
    
    for (let i = 3; i <= n; i++) {
        const current = prev1 + prev2;
        prev1 = prev2;
        prev2 = current;
    }
    
    return prev2;
}
```

### 19. 最长递增子序列
**题目：** 找到数组中最长严格递增子序列的长度。

```javascript
function lengthOfLIS(nums) {
    const dp = new Array(nums.length).fill(1);
    
    for (let i = 1; i < nums.length; i++) {
        for (let j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
    }
    
    return Math.max(...dp);
}
```

### 20. 零钱兑换
**题目：** 计算凑成总金额所需的最少硬币个数。

```javascript
function coinChange(coins, amount) {
    const dp = new Array(amount + 1).fill(Infinity);
    dp[0] = 0;
    
    for (let i = 1; i <= amount; i++) {
        for (let coin of coins) {
            if (coin <= i) {
                dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
    }
    
    return dp[amount] === Infinity ? -1 : dp[amount];
}
```

---

## 排序算法

### 21. 快速排序
**题目：** 实现快速排序算法。

```javascript
function quickSort(arr) {
    if (arr.length <= 1) return arr;
    
    const pivot = arr[Math.floor(arr.length / 2)];
    const left = arr.filter(x => x < pivot);
    const middle = arr.filter(x => x === pivot);
    const right = arr.filter(x => x > pivot);
    
    return [...quickSort(left), ...middle, ...quickSort(right)];
}
```

### 22. 归并排序
**题目：** 实现归并排序算法。

```javascript
function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    
    return merge(left, right);
}

function merge(left, right) {
    const result = [];
    let i = 0, j = 0;
    
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result.push(left[i]);
            i++;
        } else {
            result.push(right[j]);
            j++;
        }
    }
    
    return result.concat(left.slice(i)).concat(right.slice(j));
}
```

### 23. 堆排序
**题目：** 实现堆排序算法。

```javascript
function heapSort(arr) {
    const n = arr.length;
    
    // 构建最大堆
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(arr, n, i);
    }
    
    // 逐个提取元素
    for (let i = n - 1; i > 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        heapify(arr, i, 0);
    }
    
    return arr;
}

function heapify(arr, n, i) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    
    if (left < n && arr[left] > arr[largest]) {
        largest = left;
    }
    
    if (right < n && arr[right] > arr[largest]) {
        largest = right;
    }
    
    if (largest !== i) {
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        heapify(arr, n, largest);
    }
}
```

---

## 搜索算法

### 24. 二分查找
**题目：** 在有序数组中查找目标值。

```javascript
function binarySearch(nums, target) {
    let left = 0, right = nums.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (nums[mid] === target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1;
}
```

### 25. 搜索旋转排序数组
**题目：** 在旋转后的有序数组中搜索目标值。

```javascript
function search(nums, target) {
    let left = 0, right = nums.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (nums[mid] === target) return mid;
        
        if (nums[left] <= nums[mid]) {
            if (target >= nums[left] && target < nums[mid]) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        } else {
            if (target > nums[mid] && target <= nums[right]) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
    }
    
    return -1;
}
```

---

## 数学算法

### 26. 最大公约数
**题目：** 计算两个数的最大公约数。

```javascript
function gcd(a, b) {
    while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}
```

### 27. 斐波那契数列
**题目：** 计算第n个斐波那契数。

```javascript
function fibonacci(n) {
    if (n <= 1) return n;
    
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
        const temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}
```

### 28. 判断质数
**题目：** 判断一个数是否为质数。

```javascript
function isPrime(n) {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    
    for (let i = 3; i <= Math.sqrt(n); i += 2) {
        if (n % i === 0) return false;
    }
    
    return true;
}
```

---

## 图算法

### 29. 岛屿数量
**题目：** 计算二维网格中岛屿的数量。

```javascript
function numIslands(grid) {
    if (!grid || grid.length === 0) return 0;
    
    const rows = grid.length;
    const cols = grid[0].length;
    let count = 0;
    
    function dfs(r, c) {
        if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] === '0') {
            return;
        }
        
        grid[r][c] = '0';
        dfs(r + 1, c);
        dfs(r - 1, c);
        dfs(r, c + 1);
        dfs(r, c - 1);
    }
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === '1') {
                count++;
                dfs(r, c);
            }
        }
    }
    
    return count;
}
```

### 30. 课程表
**题目：** 判断是否可以完成所有课程的学习。

```javascript
function canFinish(numCourses, prerequisites) {
    const graph = new Array(numCourses).fill(null).map(() => []);
    const inDegree = new Array(numCourses).fill(0);
    
    for (const [course, prereq] of prerequisites) {
        graph[prereq].push(course);
        inDegree[course]++;
    }
    
    const queue = [];
    for (let i = 0; i < numCourses; i++) {
        if (inDegree[i] === 0) {
            queue.push(i);
        }
    }
    
    let completed = 0;
    while (queue.length > 0) {
        const course = queue.shift();
        completed++;
        
        for (const nextCourse of graph[course]) {
            inDegree[nextCourse]--;
            if (inDegree[nextCourse] === 0) {
                queue.push(nextCourse);
            }
        }
    }
    
    return completed === numCourses;
}
```

---

## 设计模式

### 31. 单例模式
**题目：** 实现一个单例模式。

```javascript
class Singleton {
    constructor() {
        if (Singleton.instance) {
            return Singleton.instance;
        }
        Singleton.instance = this;
        return this;
    }
    
    static getInstance() {
        if (!Singleton.instance) {
            Singleton.instance = new Singleton();
        }
        return Singleton.instance;
    }
}
```

### 32. 观察者模式
**题目：** 实现观察者模式。

```javascript
class Subject {
    constructor() {
        this.observers = [];
    }
    
    subscribe(observer) {
        this.observers.push(observer);
    }
    
    unsubscribe(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }
    
    notify(data) {
        this.observers.forEach(observer => observer.update(data));
    }
}

class Observer {
    constructor(name) {
        this.name = name;
    }
    
    update(data) {
        console.log(`${this.name} received: ${data}`);
    }
}
```

---

## 异步编程

### 33. Promise实现
**题目：** 实现一个简单的Promise。

```javascript
class MyPromise {
    constructor(executor) {
        this.state = 'pending';
        this.value = undefined;
        this.reason = undefined;
        this.onFulfilledCallbacks = [];
        this.onRejectedCallbacks = [];
        
        const resolve = (value) => {
            if (this.state === 'pending') {
                this.state = 'fulfilled';
                this.value = value;
                this.onFulfilledCallbacks.forEach(callback => callback());
            }
        };
        
        const reject = (reason) => {
            if (this.state === 'pending') {
                this.state = 'rejected';
                this.reason = reason;
                this.onRejectedCallbacks.forEach(callback => callback());
            }
        };
        
        try {
            executor(resolve, reject);
        } catch (error) {
            reject(error);
        }
    }
    
    then(onFulfilled, onRejected) {
        return new MyPromise((resolve, reject) => {
            if (this.state === 'fulfilled') {
                try {
                    const result = onFulfilled ? onFulfilled(this.value) : this.value;
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            } else if (this.state === 'rejected') {
                try {
                    const result = onRejected ? onRejected(this.reason) : this.reason;
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            } else {
                this.onFulfilledCallbacks.push(() => {
                    try {
                        const result = onFulfilled ? onFulfilled(this.value) : this.value;
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    }
                });
                
                this.onRejectedCallbacks.push(() => {
                    try {
                        const result = onRejected ? onRejected(this.reason) : this.reason;
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    }
                });
            }
        });
    }
}
```

### 34. 防抖函数
**题目：** 实现防抖函数。

```javascript
function debounce(func, delay) {
    let timeoutId;
    
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}
```

### 35. 节流函数
**题目：** 实现节流函数。

```javascript
function throttle(func, delay) {
    let lastCall = 0;
    
    return function(...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            return func.apply(this, args);
        }
    };
}
```

---

## 性能优化

### 36. 深拷贝
**题目：** 实现深拷贝函数。

```javascript
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
        return obj.map(item => deepClone(item));
    }
    
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}
```

### 37. 数组去重
**题目：** 实现数组去重。

```javascript
// 方法1：使用Set
function unique1(arr) {
    return [...new Set(arr)];
}

// 方法2：使用filter
function unique2(arr) {
    return arr.filter((item, index) => arr.indexOf(item) === index);
}

// 方法3：使用reduce
function unique3(arr) {
    return arr.reduce((acc, current) => {
        if (!acc.includes(current)) {
            acc.push(current);
        }
        return acc;
    }, []);
}
```

### 38. 扁平化数组
**题目：** 将多维数组扁平化。

```javascript
// 方法1：使用flat
function flatten1(arr) {
    return arr.flat(Infinity);
}

// 方法2：递归实现
function flatten2(arr) {
    const result = [];
    
    function flattenHelper(arr) {
        for (let item of arr) {
            if (Array.isArray(item)) {
                flattenHelper(item);
            } else {
                result.push(item);
            }
        }
    }
    
    flattenHelper(arr);
    return result;
}

// 方法3：使用reduce
function flatten3(arr) {
    return arr.reduce((acc, current) => {
        return acc.concat(Array.isArray(current) ? flatten3(current) : current);
    }, []);
}
```

---

## 面试技巧

### 解题思路
1. **理解题目**：仔细阅读题目，明确输入输出
2. **分析复杂度**：考虑时间复杂度和空间复杂度
3. **选择算法**：根据数据规模选择合适的算法
4. **编写代码**：注意边界条件和特殊情况
5. **测试验证**：用多个测试用例验证代码正确性

### 常见陷阱
- 数组越界
- 空指针异常
- 整数溢出
- 边界条件处理
- 递归栈溢出

### 优化建议
- 使用合适的数据结构
- 避免不必要的计算
- 考虑空间换时间
- 利用数学性质
- 使用位运算优化

---

## 总结

这份清单涵盖了2025年JavaScript算法面试中最常见的题目类型：

1. **基础算法**：数组、字符串、链表操作
2. **数据结构**：树、图、栈、队列
3. **算法思想**：动态规划、贪心、回溯、分治
4. **排序搜索**：各种排序算法和搜索算法
5. **数学算法**：数论、几何、概率
6. **设计模式**：常用设计模式的实现
7. **异步编程**：Promise、async/await相关
8. **性能优化**：深拷贝、去重、扁平化等

建议按照这个清单系统性地准备，每个题目都要能够：
- 理解算法原理
- 分析时间复杂度
- 手写实现代码
- 处理边界情况
- 进行优化改进

祝您面试顺利！🚀
