<div align="center">
  <p>
    <img src="./static/course-logo.svg" width="84" alt="自学C大纲" />
  </p>

  <h1>自学C大纲</h1>

  <p><strong>用 C 语言从内存直觉出发，逐步走到数据库实现和相似查询。</strong></p>

  <p>
    <a href="https://simgor001.github.io/c-learning-companion/">在线阅读</a>
    ·
    <a href="./content/chapters">课程章节</a>
    ·
    <a href="./content/projects">阶段项目</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Hugo-extended-ff4088?style=flat-square&logo=hugo&logoColor=white" alt="Hugo extended" />
    <img src="https://img.shields.io/badge/GitHub%20Pages-deployed-2ea44f?style=flat-square&logo=githubpages&logoColor=white" alt="GitHub Pages deployed" />
    <img src="https://img.shields.io/badge/C%20language-course-2563eb?style=flat-square" alt="C language course" />
    <img src="https://img.shields.io/badge/AIGC-assisted-64748b?style=flat-square" alt="AIGC assisted" />
  </p>
</div>

## 怎么用

1. 读每章开头的问题和最小实验，知道这一章要解决什么。
2. 自己补代码、编译运行、改输入和边界条件，观察行为变化。
3. 做“自己试试看”的题；到第 6、10、19、29、34 章后，再做对应阶段项目。

运行示例里，以 `$` 开头的行表示你要输入的内容；实际输入时只输入 `$` 后面的文字。没有 `$` 的行是程序显示的输出。

每章独立可读，但顺序走效果最好：上一章留下的问题，通常就是下一章要解决的东西。

## 推荐阅读

- **《C Primer Plus》（Stephen Prata）**：耐心、具体、实验多，零基础从头读，和本路线风格最接近。
- **《C 和指针》（Kenneth Reek）**：指针、数组、字符串、动态内存写得清楚，做第 5 章数组和第 10 章指针时对照读。
- **[菜鸟教程 — C 语言](https://www.runoob.com/cprogramming/c-tutorial.html)**：在线速查，函数签名和语法忘了快速翻。

## 四段主线

### 编程基础（第 1-10 章）

内存格子、变量、判断循环、函数、数组、字符串、结构体、文件、调用栈、指针和动态容量。这段结束时，能写出一个可保存的学生表：输入记录、存到文件，下次启动再读回来。

### 数据结构（第 11-19 章）

从动态数组的插删痛点长出链表、栈、队列、表达式计算、排序、二分查找、二叉搜索树和哈希表。第 19 章用测试、操作计数和不变量检查这些结构跑得对不对。

### 数据库（第 20-29 章）

把前面的工具组合成数组版数据库、动态数据库表、链表版存储，再加上稳定接口、多文件模块、索引、持久化、日志恢复、命令协议和状态机解析。

### 向量学习（第 30-34 章）

找“和这条记录最像的记录”时，id 不够用。这段把记录变成向量，用距离做 Top-K/KNN，再进入 KMeans 和线性回归，全部手写数组和循环，不引入 PyTorch。

## 课程章节

### 编程基础

- [第 1 章：计算机怎么记住东西的](./content/chapters/ch01.md)
- [第 2 章：变量和类型](./content/chapters/ch02.md)
- [第 3 章：判断和循环](./content/chapters/ch03.md)
- [第 4 章：函数](./content/chapters/ch04.md)
- [第 5 章：数组](./content/chapters/ch05.md)
- [第 6 章：字符串](./content/chapters/ch06.md)
- [第 7 章：结构体](./content/chapters/ch07.md)
- [第 8 章：结构体数组和表](./content/chapters/ch08.md)
- [第 9 章：文件保存和读取](./content/chapters/ch09.md)
- [第 10 章：指针和动态容量](./content/chapters/ch10.md)

### 数据结构

- [第 11 章：链表](./content/chapters/ch11.md)
- [第 12 章：栈和撤销](./content/chapters/ch12.md)
- [第 13 章：队列](./content/chapters/ch13.md)
- [第 14 章：四则运算计算器](./content/chapters/ch14.md)
- [第 15 章：排序](./content/chapters/ch15.md)
- [第 16 章：二分查找](./content/chapters/ch16.md)
- [第 17 章：二叉搜索树](./content/chapters/ch17.md)
- [第 18 章：哈希表](./content/chapters/ch18.md)
- [第 19 章：程序正确性：复杂度、测试和不变量](./content/chapters/ch19.md)

### 数据库

- [第 20 章：数组版数据库](./content/chapters/ch20.md)
- [第 21 章：动态数据库表](./content/chapters/ch21.md)
- [第 22 章：链表版存储](./content/chapters/ch22.md)
- [第 23 章：数据库接口](./content/chapters/ch23.md)
- [第 24 章：多文件编译和模块边界](./content/chapters/ch24.md)
- [第 25 章：数据库索引](./content/chapters/ch25.md)
- [第 26 章：数据库持久化](./content/chapters/ch26.md)
- [第 27 章：日志和恢复](./content/chapters/ch27.md)
- [第 28 章：命令协议](./content/chapters/ch28.md)
- [第 29 章：状态机和更稳的命令解析](./content/chapters/ch29.md)

### 向量学习

- [第 30 章：向量](./content/chapters/ch30.md)
- [第 31 章：距离和相似度](./content/chapters/ch31.md)
- [第 32 章：Top-K和KNN](./content/chapters/ch32.md)
- [第 33 章：KMeans](./content/chapters/ch33.md)
- [第 34 章：线性回归](./content/chapters/ch34.md)

## 阶段项目

- [阶段项目 1：成绩统计器](./content/projects/project-1.md)
- [阶段项目 2：可保存的学生表](./content/projects/project-2.md)
- [阶段项目 3：数据结构查找对比器](./content/projects/project-3.md)
- [阶段项目 4：命令行学生数据库](./content/projects/project-4.md)
- [阶段项目 5：相似记录查询工具](./content/projects/project-5.md)

## AIGC 声明

本课程内容使用了 AI 辅助生成，包括正文、代码示例和插图，作者主要把控内容整体方向和内容正确性。
