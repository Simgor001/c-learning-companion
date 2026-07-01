---
title: "阶段项目5：相似记录查询工具"
description: "C 语言入门课程阶段项目 5：相似记录查询工具"
weight: 5
---

## 这个项目练什么

整合 ch30–ch34 的能力：

- **ch30**：把一条记录表示成 `float vec[DIM]`。
- **ch31**：欧氏距离、点积、余弦相似度。
- **ch32**：Top-K / KNN，保留距离最小的 K 个。
- **ch33**：KMeans 按距离自动分组（可选）。
- **ch34**：线性回归（可选）。

## 任务要求

### 必须完成

1. 定义一个向量记录结构体，包含 `id`、`name`、`float vec[DIM]`（`DIM` 取 3）。
2. 内置 8 条示例数据（向量值直接写进代码），启动时加载。
3. 交互菜单：
   - `l` 列出所有记录及其向量。
   - `q` 输入 3 个浮点数作为查询向量，输出 Top-3 最相似记录（按欧氏距离升序）。
   - `x` 退出。
4. Top-K 使用"扫一遍，保留 K 个最小距离"的方式，不对全库排序。

### 可选增强

- KMeans：输入分组数 K，迭代打印每轮中心点和分组结果，最多 10 轮。
- 线性回归：选两个维度，拟合 `y = mx + b`。

## 数据与接口约定

```c
#define DIM      3
#define NAME_LEN 32
#define MAX_K    3

struct VecRecord {
    int id;
    char name[NAME_LEN];
    float vec[DIM];
};

struct VecDB {
    struct VecRecord records[100];
    int count;
};

float euclidean_dist(const float a[DIM], const float b[DIM]);

void db_init(struct VecDB *db);
void db_list(struct VecDB *db);
void db_query(struct VecDB *db, const float query[DIM], int k);
```

## 测试输入（正常）

内置数据（示意）：

| id | name  | vec[0] | vec[1] | vec[2] |
|----|-------|--------|--------|--------|
| 1  | Alice | 1.0    | 2.0    | 3.0    |
| 2  | Bob   | 4.0    | 5.0    | 6.0    |
| 3  | Carol | 1.5    | 2.5    | 3.5    |
| 4  | Dave  | 7.0    | 8.0    | 9.0    |
| 5  | Eve   | 2.0    | 1.0    | 0.0    |
| 6  | Frank | 5.0    | 5.0    | 5.0    |
| 7  | Grace | 0.0    | 0.0    | 0.0    |
| 8  | Henry | 9.0    | 9.0    | 9.0    |

查询向量：`1.0 2.0 3.0` → 最近应是 Alice（距离 0.00），其次 Carol。

## 错误输入

- 查询向量不足 3 个数 → 打印提示，重新输入。
- 查询向量非数字 → 打印提示，跳过。
- 空库查询 → 打印"没有数据"。

## 预期运行示例

```console
Loaded 8 vector records.

l list | q query top-3 | k KMeans (optional) | x exit
$ l
[1] Alice   (1.00, 2.00, 3.00)
[2] Bob     (4.00, 5.00, 6.00)
[3] Carol   (1.50, 2.50, 3.50)
[4] Dave    (7.00, 8.00, 9.00)
[5] Eve     (2.00, 1.00, 0.00)
[6] Frank   (5.00, 5.00, 5.00)
[7] Grace   (0.00, 0.00, 0.00)
[8] Henry   (9.00, 9.00, 9.00)

$ q
Enter query vector (3 floats):
$ 1.0 2.0 3.0

Top-3 most similar records:
1. Alice   (1.00, 2.00, 3.00) dist=0.000
2. Carol   (1.50, 2.50, 3.50) dist=0.866
3. Frank   (5.00, 5.00, 5.00) dist=5.385

$ x
```

## 参考实现

```c
#include <stdio.h>
#include <string.h>
#include <math.h>
#include <float.h>

#define DIM      3
#define NAME_LEN 32
#define MAX_K    3
#define MAX_REC  100

struct VecRecord {
    int id;
    char name[NAME_LEN];
    float vec[DIM];
};

struct VecDB {
    struct VecRecord records[MAX_REC];
    int count;
};

float euclidean_dist(const float a[], const float b[])
{
    float sum = 0.0f;
    for (int i = 0; i < DIM; i++) {
        float d = a[i] - b[i];
        sum += d * d;
    }
    return sqrtf(sum);
}

void db_init(struct VecDB *db)
{
    db->count = 0;
}

void db_add(struct VecDB *db, int id, const char *name, const float vec[DIM])
{
    if (db->count >= MAX_REC) return;
    struct VecRecord *r = &db->records[db->count];
    r->id = id;
    snprintf(r->name, sizeof(r->name), "%s", name);
    for (int i = 0; i < DIM; i++) r->vec[i] = vec[i];
    db->count++;
}

void db_list(struct VecDB *db)
{
    for (int i = 0; i < db->count; i++) {
        struct VecRecord *r = &db->records[i];
        printf("[%d] %-8s (%.2f, %.2f, %.2f)\n",
               r->id, r->name, r->vec[0], r->vec[1], r->vec[2]);
    }
}

void db_query(struct VecDB *db, const float query[DIM], int k)
{
    if (db->count == 0) {
        printf("No data\n");
        return;
    }
    if (k > db->count) k = db->count;

    int    best_idx[MAX_K];
    float  best_dist[MAX_K];
    int    best_cnt = 0;

    for (int i = 0; i < db->count; i++) {
        float dist = euclidean_dist(db->records[i].vec, query);

        if (best_cnt < k) {
            best_idx[best_cnt] = i;
            best_dist[best_cnt] = dist;
            best_cnt++;
        } else {
            int worst = 0;
            for (int j = 1; j < k; j++) {
                if (best_dist[j] > best_dist[worst]) worst = j;
            }
            if (dist < best_dist[worst]) {
                best_idx[worst] = i;
                best_dist[worst] = dist;
            }
        }
    }

    for (int i = 0; i < best_cnt - 1; i++) {
        for (int j = i + 1; j < best_cnt; j++) {
            if (best_dist[i] > best_dist[j]) {
                float td = best_dist[i];
                best_dist[i] = best_dist[j];
                best_dist[j] = td;
                int ti = best_idx[i];
                best_idx[i] = best_idx[j];
                best_idx[j] = ti;
            }
        }
    }

    printf("\nTop-%d most similar records:\n", k);
    for (int i = 0; i < best_cnt; i++) {
        struct VecRecord *r = &db->records[best_idx[i]];
        printf("%d. %-8s (%.2f, %.2f, %.2f) dist=%.3f\n",
               i + 1, r->name, r->vec[0], r->vec[1], r->vec[2],
               best_dist[i]);
    }
}

/* ---- 可选扩展：KMeans ---- */
#define MAX_CLUSTERS 5
#define MAX_ITERS    10

void db_kmeans(struct VecDB *db, int k)
{
    if (k > db->count || k < 1) {
        printf("Group count %d is unreasonable (record count %d)\n", k, db->count);
        return;
    }

    float centers[MAX_CLUSTERS][DIM];
    int   labels[MAX_REC];

    for (int c = 0; c < k; c++) {
        for (int d = 0; d < DIM; d++) {
            centers[c][d] = db->records[c].vec[d];
        }
    }

    for (int iter = 0; iter < MAX_ITERS; iter++) {
        for (int i = 0; i < db->count; i++) {
            float min_d = FLT_MAX;
            int best_c = 0;
            for (int c = 0; c < k; c++) {
                float d = euclidean_dist(db->records[i].vec, centers[c]);
                if (d < min_d) { min_d = d; best_c = c; }
            }
            labels[i] = best_c;
        }

        float new_centers[MAX_CLUSTERS][DIM] = {{0}};
        int   counts[MAX_CLUSTERS] = {0};
        for (int i = 0; i < db->count; i++) {
            int c = labels[i];
            for (int d = 0; d < DIM; d++) {
                new_centers[c][d] += db->records[i].vec[d];
            }
            counts[c]++;
        }

        int changed = 0;
        for (int c = 0; c < k; c++) {
            if (counts[c] == 0) continue;
            for (int d = 0; d < DIM; d++) {
                float nc = new_centers[c][d] / counts[c];
                if (fabsf(nc - centers[c][d]) > 0.001f) changed = 1;
                centers[c][d] = nc;
            }
        }
        if (!changed) { printf("Converged at iteration %d\n", iter + 1); break; }
    }

    printf("====== KMeans Clusters (K=%d) ======\n", k);
    for (int c = 0; c < k; c++) {
        printf("Cluster %d center: (%.2f, %.2f, %.2f)\n",
               c + 1, centers[c][0], centers[c][1], centers[c][2]);
        printf("  Members:");
        for (int i = 0; i < db->count; i++) {
            if (labels[i] == c) printf(" %s", db->records[i].name);
        }
        printf("\n");
    }
}

/* ---- 主程序 ---- */
int main(void)
{
    struct VecDB db;
    db_init(&db);

    /* 内置示例数据 */
    float d[][DIM] = {
        {1, 2, 3}, {4, 5, 6}, {1.5, 2.5, 3.5}, {7, 8, 9},
        {2, 1, 0}, {5, 5, 5}, {0, 0, 0},         {9, 9, 9},
    };
    const char *names[] = {"Alice","Bob","Carol","Dave",
                           "Eve","Frank","Grace","Henry"};
    for (int i = 0; i < 8; i++) db_add(&db, i + 1, names[i], d[i]);
    printf("Loaded %d vector records.\n", db.count);

    char cmd;
    printf("\nl list | q query top-%d | k KMeans | x exit\n", MAX_K);
    while (scanf(" %c", &cmd) == 1) {
        if (cmd == 'x') break;
        if (cmd == 'l') {
            db_list(&db);
        } else if (cmd == 'q') {
            float query[DIM];
            printf("Enter query vector (%d floats):\n", DIM);
            if (scanf("%f %f %f", &query[0], &query[1], &query[2]) != DIM) {
                printf("Input format error\n");
                while (getchar() != '\n');
                continue;
            }
            db_query(&db, query, MAX_K);
        } else if (cmd == 'k') {
            int k;
            printf("Enter number of clusters:\n");
            if (scanf("%d", &k) != 1) { continue; }
            db_kmeans(&db, k);
        } else {
            printf("Unknown command\n");
        }
printf("\nl list | q query top-%d | k KMeans | x exit\n", MAX_K);
    }
    return 0;
}
```

编译：`gcc -Wall -o project5 阶段项目5-相似记录查询工具.c -lm`

> 注意：`sqrtf` 和 `fabsf` 需要链接数学库 `-lm`。

## 验收清单

- [ ] 启动时加载 8 条内置数据。
- [ ] `l` 列出所有记录，向量值正确。
- [ ] `q 1.0 2.0 3.0` 返回 Alice 距离 0.000 排第一，Carol 排第二。
- [ ] `q 0 0 0` 返回 Grace 排第一。
- [ ] 空数据库 `q` 不崩溃。
- [ ] 查询向量输入不足 3 个时提示错误。
- [ ] 可选：KMeans 分组 K=2，能区分原点附近（Grace）和远点。
- [ ] 可选：KMeans 分组 K=3，能看到 3 个不同簇。

---

返回课程：[第 34 章：线性回归](../chapters/ch34.md)
