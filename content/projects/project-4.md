---
title: "阶段项目4：命令行学生数据库"
description: "C 语言入门课程阶段项目 4：命令行学生数据库"
weight: 4
---

## 这个项目练什么

整合 ch20–ch29 的能力：

- **ch20–21**：数组版数据库、动态数据库表。
- **ch22–23**：链表版存储、稳定的 `db_*` 接口。
- **ch24**：多文件编译、头文件、模块边界——这个项目拆成 6 个文件。
- **ch25**：有序 id 索引，用二分查找定位记录。
- **ch26**：持久化——把记录保存到文件，启动时加载并重建索引。
- **ch27**：日志恢复——每次增删先写操作日志，启动时回放，防止崩溃丢数据。
- **ch28**：命令协议——`INSERT`、`SELECT`、`DELETE`、`LIST`、`RANGE`。
- **ch29**：状态机解析——支持带引号的参数，让 `Alice Wang` 作为一个整体传入。

此外加入了 `argc/argv` 命令行参数：既可以交互运行，也可以一行命令操作。

## 任务要求

### 必须完成

1. 数据库核心（`student_db.c`）：带有序 id 索引的插入、二分查找、删除（维护索引）、列出、范围查询。
2. 持久化（`persistence.c`）：启动时从 `db.txt` 加载，退出时保存。加载时对坏行打印行号并跳过。
3. 日志恢复（`recovery.c`）：每次 INSERT/DELETE 写操作日志；启动时回放日志；成功后清空日志。
4. 命令解析（`command.c`）：用状态机分词（支持 `"Alice Wang"` 引号参数），把 `INSERT`、`SELECT`、`DELETE`、`LIST`、`RANGE`、`EXPORT` 转成 `db_*` 调用。
5. 主程序（`main.c`）：
   - **交互模式**：提示符 `db> `，输入命令，`exit` 退出。
   - **命令行模式**：`./db add 1 Alice 90`、`./db list`、`./db find 1`、`./db export out.csv`。

### 可选增强

- `EXPORT` 输出 CSV 带表头 `id,name,score`。
- 记录重复 id 插入时打印友好提示（已有）。

## 文件结构

```text
student_db.h       # 头文件：struct Student、struct DB、API 声明
student_db.c       # 数据库核心：插入、删除（维护索引）、二分查找、列出、范围
persistence.c      # 持久化：save_db / load_db
recovery.c         # 日志恢复：write_log / replay_log
command.c          # 命令解析：tokenize（状态机）/ run_command
main.c             # 主程序：交互循环 + argc/argv 分发
```

编译命令：`gcc -Wall -o db student_db.c persistence.c recovery.c command.c main.c`

## 数据与接口约定

```c
// student_db.h

#ifndef STUDENT_DB_H
#define STUDENT_DB_H

#define MAX_ROWS 100
#define NAME_LEN 32
#define LOGFILE "db.log"

struct Student {
    int id;
    char name[NAME_LEN];
    int score;
};

struct DB {
    struct Student rows[MAX_ROWS];
    int count;
    int index[MAX_ROWS];     // 存 rows 下标，按 id 升序
};

int  db_init(struct DB *db);
int  db_insert(struct DB *db, int id, const char *name, int score);
int  db_delete(struct DB *db, int id);
int  db_find(const struct DB *db, int id, struct Student *out);
void db_list(const struct DB *db);
void db_range(const struct DB *db, int low, int high);

/* persistence.c */
int save_db(const char *filename, const struct DB *db);
int load_db(const char *filename, struct DB *db);

/* recovery.c */
void write_log(const char *logfile, const char *msg);
void replay_log(const char *logfile, struct DB *db);

/* command.c */
int run_command(struct DB *db, const char *logfile, const char *line);

#endif
```

## 测试输入（正常）

**交互模式：**

```console
$ INSERT 1 Alice 85
INSERT 1 ok
$ INSERT 2 Bob 92
INSERT 2 ok
$ INSERT 3 "Alice Wang" 78
INSERT 3 ok
$ LIST
1 Alice 85
2 Bob 92
3 Alice Wang 78
$ SELECT 2
2 Bob 92
$ RANGE 1 2
1 Alice 85
2 Bob 92
$ DELETE 1
DELETE 1 ok
$ LIST
2 Bob 92
3 Alice Wang 78
$ EXPORT out.csv
Exported 2 records to out.csv
$ exit
```

**命令行模式：**

```text
$ ./db add 4 Eve 67
INSERT 4 ok

$ ./db list
2 Bob 92
3 Alice Wang 78
4 Eve 67

$ ./db find 3
3 Alice Wang 78

$ ./db export out.csv
Exported 3 records to out.csv
```

## 错误输入

- 未知命令：`db> HELP` → 打印"未知命令"。
- 参数缺失：`db> INSERT 5` → 打印用法提示。
- id 非数字：`db> SELECT abc` → 打印"id 不是整数"。
- 查/删不存在的 id：`db> SELECT 999` → 打印"未找到"。
- 重复 id：`db> INSERT 2 Charlie 80` → 打印"INSERT 失败（id 重复或容量满）"。
- 导出文件不可写：`db> EXPORT /root/x.csv` → 打印"无法创建"。
- `out.csv` 检查：应含表头行 `id,name,score`。

## 参考实现

### student_db.h

```c
#ifndef STUDENT_DB_H
#define STUDENT_DB_H

#define MAX_ROWS 100
#define NAME_LEN 32
#define LOGFILE "db.log"

struct Student {
    int id;
    char name[NAME_LEN];
    int score;
};

struct DB {
    struct Student rows[MAX_ROWS];
    int count;
    int index[MAX_ROWS];
};

int  db_init(struct DB *db);
int  db_insert(struct DB *db, int id, const char *name, int score);
int  db_delete(struct DB *db, int id);
int  db_find(const struct DB *db, int id, struct Student *out);
void db_list(const struct DB *db);
void db_range(const struct DB *db, int low, int high);

int save_db(const char *filename, const struct DB *db);
int load_db(const char *filename, struct DB *db);

void write_log(const char *logfile, const char *msg);
void replay_log(const char *logfile, struct DB *db);

int run_command(struct DB *db, const char *logfile, const char *line);

#endif
```

### student_db.c

```c
#include "student_db.h"
#include <stdio.h>
#include <string.h>

int db_init(struct DB *db)
{
    db->count = 0;
    return 0;
}

/* Binary search in index, returns position; returns -(insert_pos+1) if not found */
static int index_search(const struct DB *db, int id)
{
    int low = 0, high = db->count - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        int row_pos = db->index[mid];
        if (db->rows[row_pos].id == id) return mid;
        if (db->rows[row_pos].id < id) low = mid + 1;
        else high = mid - 1;
    }
    return -(low + 1);
}

int db_insert(struct DB *db, int id, const char *name, int score)
{
    if (db->count >= MAX_ROWS) return -1;
    int pos = index_search(db, id);
    if (pos >= 0) return -1;
    int ins = -(pos + 1);

    int row_pos = db->count;
    db->rows[row_pos].id = id;
    snprintf(db->rows[row_pos].name, sizeof(db->rows[row_pos].name),
             "%s", name);
    db->rows[row_pos].score = score;

    for (int i = db->count; i > ins; i--) {
        db->index[i] = db->index[i - 1];
    }
    db->index[ins] = row_pos;
    db->count++;
    return 0;
}

int db_delete(struct DB *db, int id)
{
    int pos = index_search(db, id);
    if (pos < 0) return -1;
    int row_pos = db->index[pos];

    for (int i = pos; i < db->count - 1; i++) {
        db->index[i] = db->index[i + 1];
    }

    if (row_pos < db->count - 1) {
        db->rows[row_pos] = db->rows[db->count - 1];
        for (int i = 0; i < db->count - 1; i++) {
            if (db->index[i] == db->count - 1) {
                db->index[i] = row_pos;
            }
        }
    }
    db->count--;
    return 0;
}

int db_find(const struct DB *db, int id, struct Student *out)
{
    int pos = index_search(db, id);
    if (pos < 0) return -1;
    *out = db->rows[db->index[pos]];
    return 0;
}

void db_list(const struct DB *db)
{
    for (int i = 0; i < db->count; i++) {
        printf("%d %s %d\n", db->rows[i].id,
               db->rows[i].name, db->rows[i].score);
    }
}

void db_range(const struct DB *db, int low, int high)
{
    for (int i = 0; i < db->count; i++) {
        int pos = db->index[i];
        if (db->rows[pos].id >= low && db->rows[pos].id <= high) {
            printf("%d %s %d\n", db->rows[pos].id,
                   db->rows[pos].name, db->rows[pos].score);
        }
    }
}
```

### persistence.c

```c
#include "student_db.h"
#include <stdio.h>

int save_db(const char *filename, const struct DB *db)
{
    FILE *fp = fopen(filename, "w");
    if (fp == NULL) return -1;
    for (int i = 0; i < db->count; i++) {
        fprintf(fp, "%d %s %d\n",
                db->rows[i].id, db->rows[i].name, db->rows[i].score);
    }
    fclose(fp);
    return 0;
}

int load_db(const char *filename, struct DB *db)
{
    FILE *fp = fopen(filename, "r");
    if (fp == NULL) return -1;
    char line[256];
    int lineno = 0;
    while (fgets(line, sizeof(line), fp) != NULL) {
        lineno++;
        int id, score;
        char name[NAME_LEN];
        if (sscanf(line, "%d %31s %d", &id, name, &score) != 3) {
            printf("Persistent file line %d format error, skipping\n", lineno);
            continue;
        }
        if (db_insert(db, id, name, score) != 0) {
            printf("Persistent file line %d insert failed\n", lineno);
        }
    }
    fclose(fp);
    return 0;
}
```

### recovery.c

```c
#include "student_db.h"
#include <stdio.h>
#include <string.h>

void write_log(const char *logfile, const char *msg)
{
    FILE *fp = fopen(logfile, "a");
    if (fp == NULL) return;
    fprintf(fp, "%s\n", msg);
    fclose(fp);
}

void replay_log(const char *logfile, struct DB *db)
{
    FILE *fp = fopen(logfile, "r");
    if (fp == NULL) return;

    char line[512];
    int lineno = 0;
    while (fgets(line, sizeof(line), fp) != NULL) {
        lineno++;
        size_t len = strlen(line);
        if (len > 0 && line[len - 1] == '\n') line[len - 1] = '\0';

        char cmd[16] = {0};
        int id, score;
        char name[NAME_LEN];
        int n = sscanf(line, "%15s %d %31s %d", cmd, &id, name, &score);
        if (strcmp(cmd, "INSERT") == 0 && n == 4) {
            db_insert(db, id, name, score);
        } else if (strcmp(cmd, "DELETE") == 0 && n == 2) {
            db_delete(db, id);
        } else {
            printf("Log line %d unrecognized, skipping: %s\n", lineno, line);
        }
    }
    fclose(fp);

    /* 回放后清空日志 */
    FILE *clear = fopen(logfile, "w");
    if (clear != NULL) fclose(clear);
}
```

### command.c

```c
#include "student_db.h"
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <limits.h>

/* ---- State machine tokenizer ---- */
static int tokenize(char *tokens[], int max_tokens, char *line)
{
    int count = 0;
    char *p = line;
    while (*p) {
        while (*p == ' ') p++;
        if (*p == '\0') break;
        if (count >= max_tokens) break;

        if (*p == '"') {
            p++;
            tokens[count] = p;
            while (*p && *p != '"') p++;
            if (*p == '"') { *p = '\0'; p++; }
            count++;
        } else {
            tokens[count] = p;
            while (*p && *p != ' ') p++;
            if (*p == ' ') { *p = '\0'; p++; }
            count++;
        }
    }
    return count;
}

/* ---- Safe integer parsing ---- */
static int parse_int(const char *text, int *out)
{
    if (text == NULL || *text == '\0') return -1;
    char *end;
    long val = strtol(text, &end, 10);
    if (*end != '\0') return -1;
    if (val < INT_MIN || val > INT_MAX) return -1;
    *out = (int)val;
    return 0;
}

int run_command(struct DB *db, const char *logfile, const char *line)
{
    char buf[512];
    snprintf(buf, sizeof(buf), "%s", line);
    char *tokens[10];
    int n = tokenize(tokens, 10, buf);
    if (n == 0) return 0;

    for (char *p = tokens[0]; *p; p++) {
        if (*p >= 'a' && *p <= 'z') *p = *p - 'a' + 'A';
    }

    if (strcmp(tokens[0], "INSERT") == 0) {
        if (n < 4) { printf("Usage: INSERT id name score\n"); return -1; }
        int id, score;
        if (parse_int(tokens[1], &id) != 0) {
            printf("id is not an integer\n"); return -1;
        }
        if (parse_int(tokens[3], &score) != 0) {
            printf("score is not an integer\n"); return -1;
        }
        if (db_insert(db, id, tokens[2], score) != 0) {
            printf("INSERT failed (duplicate id or capacity full)\n"); return -1;
        }
        printf("INSERT %d ok\n", id);
        char logmsg[512];
        snprintf(logmsg, sizeof(logmsg), "INSERT %d %s %d",
                 id, tokens[2], score);
        write_log(logfile, logmsg);
        return 0;
    }
    else if (strcmp(tokens[0], "SELECT") == 0) {
        if (n < 2) { printf("Usage: SELECT id\n"); return -1; }
        int id;
        if (parse_int(tokens[1], &id) != 0) {
            printf("id is not an integer\n"); return -1;
        }
        struct Student s;
        if (db_find(db, id, &s) != 0) {
            printf("Not found id=%d\n", id); return -1;
        }
        printf("%d %s %d\n", s.id, s.name, s.score);
        return 0;
    }
    else if (strcmp(tokens[0], "DELETE") == 0) {
        if (n < 2) { printf("Usage: DELETE id\n"); return -1; }
        int id;
        if (parse_int(tokens[1], &id) != 0) {
            printf("id is not an integer\n"); return -1;
        }
        if (db_delete(db, id) != 0) {
            printf("Not found id=%d\n", id); return -1;
        }
        printf("DELETE %d ok\n", id);
        char logmsg[64];
        snprintf(logmsg, sizeof(logmsg), "DELETE %d", id);
        write_log(logfile, logmsg);
        return 0;
    }
    else if (strcmp(tokens[0], "LIST") == 0) {
        db_list(db);
        return 0;
    }
    else if (strcmp(tokens[0], "RANGE") == 0) {
        if (n < 3) { printf("Usage: RANGE low high\n"); return -1; }
        int low, high;
        if (parse_int(tokens[1], &low) != 0
            || parse_int(tokens[2], &high) != 0) {
            printf("Parameter is not an integer\n"); return -1;
        }
        db_range(db, low, high);
        return 0;
    }
    else if (strcmp(tokens[0], "EXPORT") == 0) {
        if (n < 2) { printf("Usage: EXPORT filename\n"); return -1; }
        FILE *fp = fopen(tokens[1], "w");
        if (fp == NULL) {
            printf("Cannot create %s\n", tokens[1]); return -1;
        }
        fprintf(fp, "id,name,score\n");
        for (int i = 0; i < db->count; i++) {
            fprintf(fp, "%d,%s,%d\n",
                    db->rows[i].id, db->rows[i].name, db->rows[i].score);
        }
        fclose(fp);
        printf("Exported %d records to %s\n", db->count, tokens[1]);
        return 0;
    }
    else {
        printf("Unknown command: %s\n", tokens[0]);
        return -1;
    }
}
```

### main.c

```c
#include "student_db.h"
#include <stdio.h>
#include <string.h>

#define DBFILE "db.txt"

int main(int argc, char *argv[])
{
    struct DB db;
    db_init(&db);

    load_db(DBFILE, &db);
    replay_log(LOGFILE, &db);

    if (argc > 1) {
        char cmdline[512] = {0};
        if (strcmp(argv[1], "add") == 0) {
            snprintf(cmdline, sizeof(cmdline), "INSERT %s %s %s",
                     argc > 2 ? argv[2] : "",
                     argc > 3 ? argv[3] : "",
                     argc > 4 ? argv[4] : "");
        } else if (strcmp(argv[1], "find") == 0) {
            snprintf(cmdline, sizeof(cmdline), "SELECT %s",
                     argc > 2 ? argv[2] : "");
        } else if (strcmp(argv[1], "list") == 0) {
            snprintf(cmdline, sizeof(cmdline), "LIST");
        } else if (strcmp(argv[1], "export") == 0) {
            snprintf(cmdline, sizeof(cmdline), "EXPORT %s",
                     argc > 2 ? argv[2] : "out.csv");
        } else {
            printf("Usage: db add id name score | "
                   "list | find id | export file\n");
            save_db(DBFILE, &db);
            return 1;
        }
        run_command(&db, LOGFILE, cmdline);
    } else {
        char line[512];
        while (1) {
            printf("db> ");
            if (fgets(line, sizeof(line), stdin) == NULL) break;
            size_t len = strlen(line);
            if (len > 0 && line[len - 1] == '\n') line[len - 1] = '\0';
            if (strcmp(line, "exit") == 0) break;
            run_command(&db, LOGFILE, line);
        }
    }

    save_db(DBFILE, &db);
    return 0;
}
```

## 验收清单

- [ ] 6 个文件创建齐全，编译通过：`gcc -Wall -o db *.c`。
- [ ] 交互模式：`INSERT`、`SELECT`、`DELETE`、`LIST`、`RANGE`、`EXPORT` 全部可用。
- [ ] 引号参数：`INSERT 3 "Alice Wang" 78` 整体进入 `name`。
- [ ] 命令行模式：`./db add 1 Alice 85`、`./db list`、`./db find 1`、`./db export out.csv` 全部可用。
- [ ] `EXPORT` 输出 CSV 带表头 `id,name,score`。
- [ ] 退出后 `db.txt` 包含所有记录，再次启动数据恢复。
- [ ] 日志恢复：模拟崩溃（删掉 `db.txt` 但保留 `db.log`），启动后数据从日志回放。
- [ ] 删除操作维护索引：删第 1 条、中间条、最后一条后，`RANGE` 和二分查找仍正确。
- [ ] 错误输入全部覆盖：未知命令、参数缺失、非数字 id、重复 id、查/删不存在、导出不可写。
- [ ] `main.c` 不直接操作 `db.rows[]` 或 `db.index[]`，只通过 `db_*` 接口调用。

---

返回课程：[第 29 章：状态机和更稳的命令解析](../chapters/ch29.md)
