---
title: "阶段项目3：数据结构查找对比器"
description: "C 语言入门课程阶段项目 3：数据结构查找对比器"
weight: 3
---

## 这个项目练什么

整合 ch11–ch19 的能力：

- **ch11**：链表节点操作（本项目中 BST 使用左右孩子指针）。
- **ch15**：排序（为二分准备有序数组）。
- **ch16**：二分查找。
- **ch17**：二叉搜索树的插入和查找。
- **ch18**：哈希表（链地址法）。
- **ch19**：操作计数、测试不变量。

## 任务要求

1. 生成 31 个 id（用简单规则生成即可，如 1001 到 1031），作为统一数据集。
2. 构建 4 种结构：
   - **无序数组**：直接把 id 放入数组。
   - **有序数组**：对 id 数组排序（用插入排序），然后二分查找。
   - **二叉搜索树**：逐个插入 id 构建 BST。
   - **哈希表**：用链地址法（`HT_SIZE = 7`），冲突时链表追加。
3. 对一组查询 id（包含存在的和不存在的），分别统计**每次查找的比较次数**。
   - 查找不存在的 id 时，也要统计比较次数：线性要扫完整个数组才算确认不存在。
4. 打印对比表，表头：id、查询直线次数、二分次数、BST次数、哈希次数。
5. 可选增强（加分）：扩展到 1000 条随机数据，比较 100 次随机查询，打印各结构的总比较次数。

## 数据与接口约定

```c
#define HT_SIZE 7

// 数组结构
struct ArrayData {
    int ids[100];
    int count;
};

// BST 节点
struct BSTNode {
    int id;
    struct BSTNode *left;
    struct BSTNode *right;
};

// 哈希表节点
struct HashNode {
    int id;
    struct HashNode *next;
};
```

核心函数签名：

```c
int  linear_search(int ids[], int count, int target, int *cmp_count);
int  insertion_sort(int ids[], int count);
int  binary_search(int ids[], int count, int target, int *cmp_count);
void bst_insert(struct BSTNode **root, int id);
int  bst_search(struct BSTNode *root, int target, int *cmp_count);
void hash_insert(struct HashNode *table[], int id);
int  hash_search(struct HashNode *table[], int target, int *cmp_count);
void bst_free(struct BSTNode *root);
void hash_free(struct HashNode *table[]);
```

## 测试输入（数据）

数据集 id：`1001, 1005, 1003, 1008, 1002, 1007, 1004, 1006`（8 个，足够展示差异）。

查询 id：`1001, 1005, 1008, 1004, 9999`（前 4 个存在，最后一个不存在）。

## 错误输入

- 查询不存在的 id → 各结构应对自己的终止条件计数。
- 空数据集 → 所有查找返回"不存在"，比较次数为 0。
- 重复 id 插入 → BST 和哈希表应跳过重复项（不插入）。

## 预期运行示例

```text
Dataset: 1001 1005 1003 1008 1002 1007 1004 1006

========== Comparison Table ==========
id       Linear Binary BST   Hash
1001      1     3     1     1
1005      2     3     2     1
1008      3     1     3     1
1004      7     3     4     1
9999      8     4     3     1

Total comparisons:
Linear: 21    Binary: 14    BST: 13    Hash: 5
```

（具体数字依插入顺序和排序后位置而定，上表为示意。）

## 参考实现

```c
#include <stdio.h>
#include <stdlib.h>

#define HT_SIZE 7

/* ---- 数组 ---- */
int linear_search(int ids[], int count, int target, int *cmp_count)
{
    *cmp_count = 0;
    for (int i = 0; i < count; i++) {
        (*cmp_count)++;
        if (ids[i] == target) return i;
    }
    return -1;
}

int insertion_sort(int ids[], int count)
{
    for (int i = 1; i < count; i++) {
        int key = ids[i];
        int j = i - 1;
        while (j >= 0 && ids[j] > key) {
            ids[j + 1] = ids[j];
            j--;
        }
        ids[j + 1] = key;
    }
    return 0;
}

int binary_search(int ids[], int count, int target, int *cmp_count)
{
    *cmp_count = 0;
    int low = 0, high = count - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        (*cmp_count)++;
        if (ids[mid] == target) return mid;
        (*cmp_count)++;
        if (ids[mid] < target) low = mid + 1;
        else                   high = mid - 1;
    }
    return -1;
}

/* ---- BST ---- */
struct BSTNode {
    int id;
    struct BSTNode *left;
    struct BSTNode *right;
};

void bst_insert(struct BSTNode **root, int id)
{
    if (*root == NULL) {
        struct BSTNode *n = malloc(sizeof(*n));
        n->id = id;
        n->left = n->right = NULL;
        *root = n;
        return;
    }
    if (id < (*root)->id)       bst_insert(&(*root)->left, id);
    else if (id > (*root)->id)  bst_insert(&(*root)->right, id);
    /* 相等跳过 */
}

int bst_search(struct BSTNode *root, int target, int *cmp_count)
{
    *cmp_count = 0;
    while (root != NULL) {
        (*cmp_count)++;
        if (root->id == target) return 1;
        (*cmp_count)++;
        if (target < root->id) root = root->left;
        else                   root = root->right;
    }
    return 0;
}

void bst_free(struct BSTNode *root)
{
    if (root == NULL) return;
    bst_free(root->left);
    bst_free(root->right);
    free(root);
}

/* ---- 哈希表（链地址法） ---- */
struct HashNode {
    int id;
    struct HashNode *next;
};

int hash_func(int id) { return id % HT_SIZE; }

void hash_insert(struct HashNode *table[], int id)
{
    int bucket = hash_func(id);
    struct HashNode *p = table[bucket];
    while (p != NULL) {
        if (p->id == id) return;  // 重复跳过
        p = p->next;
    }
    struct HashNode *n = malloc(sizeof(*n));
    n->id = id;
    n->next = table[bucket];
    table[bucket] = n;
}

int hash_search(struct HashNode *table[], int target, int *cmp_count)
{
    *cmp_count = 0;
    int bucket = hash_func(target);
    struct HashNode *p = table[bucket];
    while (p != NULL) {
        (*cmp_count)++;
        if (p->id == target) return 1;
        p = p->next;
    }
    return 0;
}

void hash_free(struct HashNode *table[])
{
    for (int i = 0; i < HT_SIZE; i++) {
        struct HashNode *p = table[i];
        while (p != NULL) {
            struct HashNode *next = p->next;
            free(p);
            p = next;
        }
        table[i] = NULL;
    }
}

/* ---- 测试主程序 ---- */
int main(void)
{
    int data[] = {1001, 1005, 1003, 1008, 1002, 1007, 1004, 1006};
    int n      = sizeof(data) / sizeof(data[0]);

    /* 1. 构建 4 种结构 */
    int linear_arr[100], sorted_arr[100];
    for (int i = 0; i < n; i++) {
        linear_arr[i] = data[i];
        sorted_arr[i] = data[i];
    }
    insertion_sort(sorted_arr, n);

    struct BSTNode *bst_root = NULL;
    for (int i = 0; i < n; i++) bst_insert(&bst_root, data[i]);

    struct HashNode *ht[HT_SIZE] = {NULL};
    for (int i = 0; i < n; i++) hash_insert(ht, data[i]);

    /* 2. 查询并统计 */
    int queries[] = {1001, 1005, 1008, 1004, 9999};
    int qn        = sizeof(queries) / sizeof(queries[0]);

    printf("id       Linear Binary BST   Hash\n");
    int total[4] = {0, 0, 0, 0};
    for (int i = 0; i < qn; i++) {
        int target = queries[i];
        int cmp_lin, cmp_bin, cmp_bst, cmp_hash;

        linear_search(linear_arr, n, target, &cmp_lin);
        binary_search(sorted_arr, n, target, &cmp_bin);
        bst_search(bst_root, target, &cmp_bst);
        hash_search(ht, target, &cmp_hash);

        printf("%-8d %-5d %-5d %-5d %-5d\n",
               target, cmp_lin, cmp_bin, cmp_bst, cmp_hash);

        total[0] += cmp_lin;
        total[1] += cmp_bin;
        total[2] += cmp_bst;
        total[3] += cmp_hash;
    }

    printf("\nTotal comparisons:\n");
    printf("Linear: %-6d Binary: %-6d BST: %-6d Hash: %-6d\n",
           total[0], total[1], total[2], total[3]);

    bst_free(bst_root);
    hash_free(ht);
    return 0;
}
```

编译：`gcc -Wall -o project3 阶段项目3-数据结构查找对比器.c`

## 验收清单

- [ ] 8 个 id 正确插入 4 种结构。
- [ ] 查找存在的 id，各结构返回正确。
- [ ] 查找不存在的 id（9999），各结构返回"不存在"。
- [ ] 比较次数合理：线性 ≤ n，二分 ≈ log₂n，BST 依树形，哈希 ≈ 1。
- [ ] 重复 id 不重复插入。
- [ ] 程序退出前释放 BST 和哈希表的所有动态节点。
- [ ] 可选：扩展到 1000 条，比较 100 次随机查询，观察总比较次数差距。

---

返回课程：[第 19 章：程序正确性：复杂度、测试和不变量](../chapters/ch19.md)
