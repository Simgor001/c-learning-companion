---
title: "阶段项目2：可保存的学生表"
description: "C 语言入门课程阶段项目 2：可保存的学生表"
weight: 2
---

## 这个项目练什么

整合 ch7–ch10 的能力：

- **ch7–8**：`struct Student` 和结构体数组。
- **ch9**：`fopen/fclose/fscanf/fprintf`，文件保存与读取。
- **ch10**：`malloc/realloc/free`，动态容量 + 指针传地址。

## 任务要求

1. 动态学生表：初始容量 4，每次容量不够时 `realloc` 翻倍。
2. 启动时调用 `load_students("students.txt")` 尝试加载已有文件。
   - 文件不存在时，从空表开始，**不报错**。
   - 文件中某行格式错误（字段不足、分数非数字）时，打印行号和原因，跳过该行，继续加载后续行。
3. 交互菜单：输入 `a` 添加、`l` 列出、`f` 按 id 查找、`d` 按 id 删除、`q` 保存并退出。
4. 退出时调用 `save_students("students.txt")` 保存。
5. `malloc` 或 `realloc` 失败时，打印错误，释放已分配的资源，退出程序。
6. 删除不存在的 id 时，打印"未找到"。

## 数据与接口约定

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define NAME_LEN 32

struct Student {
    int id;
    char name[NAME_LEN];
    int score;
};

struct StudentTable {
    struct Student *students;   // 动态数组
    int count;
    int capacity;
};

// 初始化表，分配初始容量
int  table_init(struct StudentTable *t, int init_cap);

// 销毁表，释放内存
void table_free(struct StudentTable *t);

// 添加一条记录，容量不够时自动扩容；返回 0 成功，-1 失败
int  table_add(struct StudentTable *t, int id, const char *name, int score);

// 按 id 查找，返回下标；找不到返回 -1
int  table_find(struct StudentTable *t, int id);

// 按 id 删除；返回 0 成功，-1 未找到
int  table_delete(struct StudentTable *t, int id);

// 列出全部记录
void table_list(struct StudentTable *t);

// 从文件加载；返回 0 成功，-1 部分错误
int  load_students(const char *filename, struct StudentTable *t);

// 保存到文件；返回 0 成功，-1 失败
int  save_students(const char *filename, struct StudentTable *t);
```

文件格式：每行 `学号 姓名 分数`，以空格分隔。

## 测试输入（正常）

交互过程：

```text
$ a
$ 1001 Alice 85
$ l
$ a
$ 1002 Bob 92
$ l
$ f
$ 1001
$ d
$ 1001
$ l
$ q
```

查看 `students.txt` 应只有 `1002 Bob 92` 一行。

## 错误输入

**启动时** `students.txt` 含坏行：
```text
1001 Alice 85
1002 Bob
badline
1003 Carol 88
1004 Dave 33
```

加载后应打印行号 + 错误原因，表内应有 `1001 Alice 85`、`1003 Carol 88` 两条（`1002` 和 `badline` 被跳过）。

**交互时**删除不存在的 id：
```console
$ d 9999
```
应打印"未找到"。

**内存失败**（无法正常测试，代码中保留 `NULL` 检查路径即可）。

## 预期运行示例

```text
Loading students.txt... OK, 3 records loaded

a add | l list | f find | d delete | q save & quit
$ a
Enter ID Name Score:
$ 1004 Eve 72
Added

$ l
[1] 1001 Alice 85
[2] 1002 Bob 92
[3] 1003 Carol 88
[4] 1004 Eve 72

$ f
Enter ID:
$ 1002
Found: 1002 Bob 92

$ d
Enter ID:
$ 1001
Deleted

$ q
Saved 3 records to students.txt
```

## 参考实现

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define NAME_LEN 32

struct Student {
    int id;
    char name[NAME_LEN];
    int score;
};

struct StudentTable {
    struct Student *students;
    int count;
    int capacity;
};

int table_init(struct StudentTable *t, int init_cap)
{
    t->students = malloc(init_cap * sizeof(*t->students));
    if (t->students == NULL) {
        printf("Memory allocation failed\n");
        return -1;
    }
    t->count = 0;
    t->capacity = init_cap;
    return 0;
}

void table_free(struct StudentTable *t)
{
    free(t->students);
    t->students = NULL;
    t->count = 0;
    t->capacity = 0;
}

static int ensure_capacity(struct StudentTable *t)
{
    if (t->count < t->capacity) return 0;
    int new_cap = t->capacity * 2;
    struct Student *tmp = realloc(t->students,
                                  new_cap * sizeof(*t->students));
    if (tmp == NULL) {
        printf("Expansion failed (capacity %d -> %d)\n", t->capacity, new_cap);
        return -1;
    }
    t->students = tmp;
    t->capacity = new_cap;
    return 0;
}

int table_add(struct StudentTable *t, int id, const char *name, int score)
{
    if (ensure_capacity(t) != 0) return -1;
    int pos = t->count;
    t->students[pos].id = id;
    snprintf(t->students[pos].name, sizeof(t->students[pos].name),
             "%s", name);
    t->students[pos].score = score;
    t->count++;
    return 0;
}

int table_find(struct StudentTable *t, int id)
{
    for (int i = 0; i < t->count; i++) {
        if (t->students[i].id == id) return i;
    }
    return -1;
}

int table_delete(struct StudentTable *t, int id)
{
    int pos = table_find(t, id);
    if (pos < 0) return -1;
    for (int i = pos; i < t->count - 1; i++) {
        t->students[i] = t->students[i + 1];
    }
    t->count--;
    return 0;
}

void table_list(struct StudentTable *t)
{
    for (int i = 0; i < t->count; i++) {
        printf("[%d] %d %s %d\n", i + 1, t->students[i].id,
               t->students[i].name, t->students[i].score);
    }
}

int load_students(const char *filename, struct StudentTable *t)
{
    FILE *fp = fopen(filename, "r");
    if (fp == NULL) {
        printf("File %s not found, starting from empty table\n", filename);
        return 0;
    }
    int lineno = 0, loaded = 0, skipped = 0;
    char line[256];
    while (fgets(line, sizeof(line), fp) != NULL) {
        lineno++;
        int id, score;
        char name[NAME_LEN];
        int n = sscanf(line, "%d %31s %d", &id, name, &score);
        if (n != 3) {
            printf("Line %d format error (insufficient fields), skipping: %s", lineno, line);
            skipped++;
            continue;
        }
        if (table_add(t, id, name, score) != 0) {
            printf("Line %d add failed (possibly out of memory)\n", lineno);
            skipped++;
            continue;
        }
        loaded++;
    }
    fclose(fp);
    printf("Load complete: %d loaded, %d skipped\n", loaded, skipped);
    return skipped > 0 ? -1 : 0;
}

int save_students(const char *filename, struct StudentTable *t)
{
    FILE *fp = fopen(filename, "w");
    if (fp == NULL) {
        printf("Cannot open %s for writing\n", filename);
        return -1;
    }
    for (int i = 0; i < t->count; i++) {
        fprintf(fp, "%d %s %d\n", t->students[i].id,
                t->students[i].name, t->students[i].score);
    }
    fclose(fp);
    return 0;
}

int main(void)
{
    struct StudentTable t;
    if (table_init(&t, 4) != 0) return 1;

    load_students("students.txt", &t);
    printf("\na add | l list | f find | d delete | q save & quit\n");

    char cmd;
    while (scanf(" %c", &cmd) == 1) {
        if (cmd == 'q') break;
        if (cmd == 'a') {
            int id, score;
            char name[NAME_LEN];
            printf("Enter ID Name Score:\n");
            if (scanf("%d %31s %d", &id, name, &score) != 3) {
                printf("Input format error\n");
                while (getchar() != '\n');
                continue;
            }
            if (table_add(&t, id, name, score) == 0) {
                printf("Added\n");
            }
        } else if (cmd == 'l') {
            table_list(&t);
        } else if (cmd == 'f') {
            int id;
            printf("Enter ID:\n");
            if (scanf("%d", &id) != 1) { continue; }
            int pos = table_find(&t, id);
            if (pos >= 0) {
                printf("Found: %d %s %d\n",
                       t.students[pos].id, t.students[pos].name,
                       t.students[pos].score);
            } else {
                printf("Not found\n");
            }
        } else if (cmd == 'd') {
            int id;
            printf("Enter ID:\n");
            if (scanf("%d", &id) != 1) { continue; }
            if (table_delete(&t, id) == 0) {
                printf("Deleted\n");
            } else {
                printf("Not found\n");
            }
        } else {
            printf("Unknown command\n");
        }
printf("\na add | l list | f find | d delete | q save & quit\n");
    }

    save_students("students.txt", &t);
    printf("Saved %d records to students.txt\n", t.count);
    table_free(&t);
    return 0;
}
```

编译：`gcc -Wall -o project2 阶段项目2-可保存的学生表.c`

## 验收清单

- [ ] 首次运行（`students.txt` 不存在），从空表开始。
- [ ] 添加 3 条记录后退出，`students.txt` 有 3 行。
- [ ] 再次运行，从 `students.txt` 加载 3 条，`l` 列出正确。
- [ ] 添加第 5 条时触发扩容（初始 4 -> 8），不崩溃。
- [ ] `students.txt` 含坏行时，跳过并打印行号，正常行不受影响。
- [ ] 删除不存在的 id，打印"未找到"。
- [ ] 查找不存在的 id，打印"未找到"。
- [ ] 退出后 `table_free` 调用 `free(t->students)`。

---

返回课程：[第 10 章：指针和动态容量](../chapters/ch10.md)
