import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "techmap.db");
const db = new Database(dbPath);

// 初始化数据库表
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT,
      layer_id INTEGER NOT NULL,
      display_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS tech_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('active', 'missing')),
      priority TEXT CHECK(priority IN ('high', 'medium', 'low', '')),
      is_new INTEGER DEFAULT 0,
      description TEXT,
      tags TEXT,
      display_order INTEGER DEFAULT 0,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS layers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT,
      display_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `);
}

// 获取所有层级
export function getLayers() {
  return db
    .prepare("SELECT DISTINCT * FROM layers ORDER BY display_order")
    .all();
}

// 更新层级
export function updateLayer(
  id: number,
  name: string,
  icon: string,
  display_order: number,
) {
  const stmt = db.prepare(
    "UPDATE layers SET name = ?, icon = ?, display_order = ? WHERE id = ?",
  );
  return stmt.run(name, icon, display_order, id);
}

// 删除层级
export function deleteLayer(id: number) {
  const stmt = db.prepare("DELETE FROM layers WHERE id = ?");
  return stmt.run(id);
}

// 获取所有分类
export function getCategories() {
  return db
    .prepare(
      "SELECT DISTINCT * FROM categories ORDER BY layer_id, display_order",
    )
    .all();
}

// 更新分类
export function updateCategory(
  id: number,
  name: string,
  icon: string,
  layer_id: number,
  display_order: number,
) {
  const stmt = db.prepare(
    "UPDATE categories SET name = ?, icon = ?, layer_id = ?, display_order = ? WHERE id = ?",
  );
  return stmt.run(name, icon, layer_id, display_order, id);
}

// 删除分类
export function deleteCategory(id: number) {
  const stmt = db.prepare("DELETE FROM categories WHERE id = ?");
  return stmt.run(id);
}

// 获取所有技术项
export function getTechItems() {
  return db
    .prepare(
      "SELECT DISTINCT * FROM tech_items ORDER BY category_id, display_order",
    )
    .all();
}

// 添加层级
export function addLayer(name: string, icon: string, display_order: number) {
  const stmt = db.prepare(
    "INSERT INTO layers (name, icon, display_order) VALUES (?, ?, ?)",
  );
  return stmt.run(name, icon, display_order);
}

// 添加分类
export function addCategory(
  name: string,
  icon: string,
  layer_id: number,
  display_order: number,
) {
  const stmt = db.prepare(
    "INSERT INTO categories (name, icon, layer_id, display_order) VALUES (?, ?, ?, ?)",
  );
  return stmt.run(name, icon, layer_id, display_order);
}

// 添加技术项
export function addTechItem(data: {
  name: string;
  category_id: number;
  status: string;
  priority?: string;
  is_new?: number;
  description?: string;
  tags?: string;
  display_order?: number;
}) {
  const stmt = db.prepare(`
    INSERT INTO tech_items (name, category_id, status, priority, is_new, description, tags, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(
    data.name,
    data.category_id,
    data.status,
    data.priority || "",
    data.is_new || 0,
    data.description || "",
    data.tags || "",
    data.display_order || 0,
  );
}

// 更新技术项
export function updateTechItem(
  id: number,
  data: {
    name?: string;
    status?: string;
    priority?: string;
    is_new?: number;
    description?: string;
    tags?: string;
  },
) {
  const fields = [];
  const values = [];

  if (data.name) {
    fields.push("name = ?");
    values.push(data.name);
  }
  if (data.status) {
    fields.push("status = ?");
    values.push(data.status);
  }
  if (data.priority !== undefined) {
    fields.push("priority = ?");
    values.push(data.priority);
  }
  if (data.is_new !== undefined) {
    fields.push("is_new = ?");
    values.push(data.is_new);
  }
  if (data.description !== undefined) {
    fields.push("description = ?");
    values.push(data.description);
  }
  if (data.tags !== undefined) {
    fields.push("tags = ?");
    values.push(data.tags);
  }

  if (fields.length === 0) return;

  values.push(id);
  const stmt = db.prepare(
    `UPDATE tech_items SET ${fields.join(", ")} WHERE id = ?`,
  );
  return stmt.run(...values);
}

// 删除技术项
export function deleteTechItem(id: number) {
  const stmt = db.prepare("DELETE FROM tech_items WHERE id = ?");
  return stmt.run(id);
}

// 获取统计数据
export function getStats() {
  const active = db
    .prepare("SELECT COUNT(*) as count FROM tech_items WHERE status = 'active'")
    .get() as { count: number };
  const missing = db
    .prepare(
      "SELECT COUNT(*) as count FROM tech_items WHERE status = 'missing'",
    )
    .get() as { count: number };
  const total = active.count + missing.count;
  const coverage =
    total > 0 ? ((active.count / total) * 100).toFixed(1) : "0.0";

  return {
    active: active.count,
    missing: missing.count,
    total,
    coverage,
  };
}

// 批量更新层级顺序
export function updateLayerOrder(
  updates: { id: number; display_order: number }[],
) {
  const stmt = db.prepare("UPDATE layers SET display_order = ? WHERE id = ?");
  const updateMany = db.transaction((items) => {
    for (const item of items) {
      stmt.run(item.display_order, item.id);
    }
  });
  updateMany(updates);
}

// 批量更新分类顺序
export function updateCategoryOrder(
  updates: { id: number; display_order: number }[],
) {
  const stmt = db.prepare(
    "UPDATE categories SET display_order = ? WHERE id = ?",
  );
  const updateMany = db.transaction((items) => {
    for (const item of items) {
      stmt.run(item.display_order, item.id);
    }
  });
  updateMany(updates);
}

// 批量更新技术项顺序
export function updateTechItemOrder(
  updates: { id: number; display_order: number }[],
) {
  const stmt = db.prepare(
    "UPDATE tech_items SET display_order = ? WHERE id = ?",
  );
  const updateMany = db.transaction((items) => {
    for (const item of items) {
      stmt.run(item.display_order, item.id);
    }
  });
  updateMany(updates);
}

// 清空所有数据
export function clearDb() {
  db.transaction(() => {
    db.prepare("DELETE FROM tech_items").run();
    db.prepare("DELETE FROM categories").run();
    db.prepare("DELETE FROM layers").run();
    db.prepare("DELETE FROM users").run();
    // 重置自增 ID
    db.prepare("DELETE FROM sqlite_sequence").run();
  })();
}

// 获取用户
export function getUser(username: string) {
  return db.prepare("SELECT * FROM users WHERE username = ?").get(username) as
    | any
    | undefined;
}

// 添加用户 (供 seed 使用)
export function addUser(username: string, password: string) {
  const stmt = db.prepare(
    "INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)",
  );
  return stmt.run(username, password);
}

export default db;
