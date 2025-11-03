// ```
// 示例 1:
// 输入：head = [1, 2, 3, 4, 5]
// 输出：[5, 4, 3, 2, 1]

// 可视化：
// 反转前：1 -> 2 -> 3 -> 4 -> 5 -> null
// 反转后：5 -> 4 -> 3 -> 2 -> 1 -> null

// 示例 2:
// 输入：head = [1, 2]
// 输出：[2, 1]

// 可视化：
// 反转前：1 -> 2 -> null
// 反转后：2 -> 1 -> null

// 示例 3:
// 输入：head = []
// 输出：[]
// 解释：空链表反转后仍然是空链表
// ```

function fanzhuan (node) {
  let prev = null;
  let currentNode = node;
  while (currentNode) {
    const next = currentNode.next;
    currentNode.next = prev;
    prev = currentNode;
    currentNode = next;
  }
  return prev;
}