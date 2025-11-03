// # 合并两个有序链表

// ## 问题描述

// 将两个升序链表合并为一个新的**升序**链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。

// **链表节点定义：**
// ```typescript
// class ListNode {
//   val: number;
//   next: ListNode | null;
//   constructor(val?: number, next?: ListNode | null) {
//     this.val = (val === undefined ? 0 : val);
//     this.next = (next === undefined ? null : next);
//   }
// }
// ```

// **例如：**
// ```
// 示例 1:
// 输入：list1 = [1, 2, 4], list2 = [1, 3, 4]
// 输出：[1, 1, 2, 3, 4, 4]

// 可视化：
// list1: 1 -> 2 -> 4 -> null
// list2: 1 -> 3 -> 4 -> null
// 结果:  1 -> 1 -> 2 -> 3 -> 4 -> 4 -> null

// 示例 2:
// 输入：list1 = [], list2 = []
// 输出：[]

// 示例 3:
// 输入：list1 = [], list2 = [0]
// 输出：[0]
// ```

function connactList(list1, list2) {
    const node1 = list1;
    const node2 = list2;
    let currentNode = {
        val: null,
        next: null,
    }
    while (node1 && node2) {
        if (node1.val <= node2.val) {
            currentNode.next = node1;
            node1 = node1.next;
        } else {
            currentNode.next = node2;
            node2 = node2.next;
        }
        currentNode = currentNode.next;
    }
}