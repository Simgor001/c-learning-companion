---
title: "阶段项目1：成绩统计器"
description: "C 语言入门课程阶段项目 1：成绩统计器"
weight: 1
---

## 这个项目练什么

整合 ch1–ch6 的能力：

- **ch1–2**：变量、类型、`int` 和 `char` 数组。
- **ch3**：`while` 循环读入，`if` 判断及格。
- **ch4**：把统计和查找拆成函数。
- **ch5**：用 `struct` 数组存一批记录，`count` 记录实际数量。
- **ch6**：`char name[32]` 存姓名，`strcmp` 比较。

## 任务要求

1. 声明一个固定容量的学生表 `struct Student table[100]`。
2. 循环读入：每行输入 `学号 姓名 分数`，学号输入 `0` 停止。
3. 输入格式错误（学号非数字、姓名或分数缺失）时，打印提示并跳过，不崩溃。
4. 容量用满时，打印提示并停止录入，已录入的数据不受影响。
5. 录入结束后，打印统计：最高分、最低分、平均分（保留 2 位小数）、及格（≥60）人数。
6. 打印全部学生列表。
7. 进入按姓名查找循环：输入姓名，打印对应记录；输入 `.` 退出查找。
8. 查找不到时打印友好提示。

## 数据与接口约定

```c
#define MAX_STUDENTS 100
#define NAME_LEN      32

struct Student {
    int id;
    char name[NAME_LEN];
    int score;
};

// 打印最高分、最低分、平均分、及格人数
void print_stats(struct Student *table, int count);

// 按姓名查找，返回下标；找不到返回 -1
int find_by_name(struct Student *table, int count, const char *name);
```

## 测试输入（正常）

```text
$ 1001 Alice 85
$ 1002 Bob 92
$ 1003 Carol 55
$ 1004 Dave 73
$ 1005 Eve 68
$ 0
$ Alice
$ Bob
$ Eve
$ .
```

## 错误输入

```text
$ abc Alice 85
$ 1002 Bob
$ 1003
$ 1004 Carol 105
$ 0
```

上面的输入依次覆盖：学号不是数字、缺少分数、缺少姓名和分数，以及录入 105 分（分数范围由使用者负责校验）。

容量满测试：先快速录入 100 条，再尝试录第 101 条，应打印容量满提示。

## 预期运行示例

```text
Enter students (ID Name Score, 0 to finish):
$ 1001 Alice 85
$ 1002 Bob 92
$ 1003 Carol 55
$ 1004 Dave 73
$ 1005 Eve 68
$ 0

========== Statistics ==========
Max: 92
Min: 55
Average: 74.60
Pass: 4/5

========== Student List ==========
1001 Alice 85
1002 Bob 92
1003 Carol 55
1004 Dave 73
1005 Eve 68

Search by name (enter . to quit):
$ Alice
Found: 1001 Alice 85
$ Zoe
Not found
$ .
```

## 参考实现

```c
#include <stdio.h>
#include <string.h>

#define MAX_STUDENTS 100
#define NAME_LEN      32

struct Student {
    int id;
    char name[NAME_LEN];
    int score;
};

void print_stats(struct Student *table, int count)
{
    if (count == 0) {
        printf("No data\n");
        return;
    }
    int max = table[0].score, min = table[0].score;
    int sum = 0, pass = 0;
    for (int i = 0; i < count; i++) {
        int s = table[i].score;
        if (s > max) max = s;
        if (s < min) min = s;
        sum += s;
        if (s >= 60) pass++;
    }
    printf("Max: %d\n", max);
    printf("Min: %d\n", min);
    printf("Average: %.2f\n", (float)sum / count);
    printf("Pass: %d/%d\n", pass, count);
}

int find_by_name(struct Student *table, int count, const char *name)
{
    for (int i = 0; i < count; i++) {
        if (strcmp(table[i].name, name) == 0) return i;
    }
    return -1;
}

int main(void)
{
    struct Student table[MAX_STUDENTS];
    int count = 0;

    printf("Enter students (ID Name Score, 0 to finish):\n");
    while (1) {
        int id, score;
        char name[NAME_LEN];
        if (scanf("%d", &id) != 1) {
            printf("ID is not a number, skipping\n");
            while (getchar() != '\n');
            continue;
        }
        if (id == 0) break;
        if (scanf("%31s %d", name, &score) != 2) {
            printf("Failed to read name or score, skipping\n");
            while (getchar() != '\n');
            continue;
        }
        if (count >= MAX_STUDENTS) {
            printf("Capacity full (%d), stopping input\n", MAX_STUDENTS);
            while (getchar() != '\n');
            break;
        }
        table[count].id = id;
        snprintf(table[count].name, sizeof(table[count].name), "%s", name);
        table[count].score = score;
        count++;
    }

    printf("\n========== Statistics ==========\n");
    print_stats(table, count);

    printf("\n========== Student List ==========\n");
    for (int i = 0; i < count; i++) {
        printf("%d %s %d\n", table[i].id, table[i].name, table[i].score);
    }

    printf("\nSearch by name (enter . to quit):\n");
    char query[NAME_LEN];
    while (scanf("%31s", query) == 1) {
        if (strcmp(query, ".") == 0) break;
        int idx = find_by_name(table, count, query);
        if (idx >= 0) {
            printf("Found: %d %s %d\n",
                   table[idx].id, table[idx].name, table[idx].score);
        } else {
            printf("Not found\n");
        }
    }

    return 0;
}
```

编译：`gcc -Wall -o project1 阶段项目1-成绩统计器.c`

## 验收清单

- [ ] 正常输入 5 个学生，统计正确。
- [ ] 学号非数字时跳过，不崩溃。
- [ ] 姓名或分数缺失时跳过，不崩溃。
- [ ] 容量满时打印提示并停止录入。
- [ ] 查找存在的姓名，打印对应记录。
- [ ] 查找不存在的姓名，打印"未找到"。
- [ ] 输入 `.` 正常退出查找循环。
- [ ] 0 条数据时统计不崩溃。

---

返回课程：[第 6 章：字符串](../chapters/ch06.md)
