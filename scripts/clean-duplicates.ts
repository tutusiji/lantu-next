import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "techmap.db");
const db = new Database(dbPath);

console.log("开始清理重复数据...\n");

// 清理 layers 表的重复数据
console.log("清理 layers 表...");
const layersDuplicates = db
  .prepare(
    `
  SELECT name, MIN(id) as keep_id, COUNT(*) as cnt
  FROM layers
  GROUP BY name
  HAVING cnt > 1
`,
  )
  .all();

interface DuplicateRow {
  name: string;
  keep_id: number;
  cnt: number;
}

layersDuplicates.forEach((row: unknown) => {
  const duplicate = row as DuplicateRow;
  console.log(`  - 发现重复层级: ${duplicate.name} (保留 ID: ${duplicate.keep_id})`);
  
  // 将所有指向重复层级的分类重新指向保留的层级
  db.prepare(`
    UPDATE categories 
    SET layer_id = ? 
    WHERE layer_id IN (
      SELECT id FROM layers WHERE name = ? AND id != ?
    )
  `).run(duplicate.keep_id, duplicate.name, duplicate.keep_id);

  // 删除重复层级
  db.prepare(
    `
    DELETE FROM layers 
    WHERE name = ? AND id != ?
  `,
  ).run(duplicate.name, duplicate.keep_id);
});

// 清理 categories 表的重复数据
console.log("\n清理 categories 表...");

// 首先处理带空格和不带空格的“生态”分类合并
const ecoUpdates = [
  { from: "Java 生态", to: "Java生态" },
  { from: "Go 生态", to: "Go生态" },
  { from: "Rust 生态", to: "Rust生态" }
];

ecoUpdates.forEach(update => {
  const toCat = db.prepare("SELECT id FROM categories WHERE name = ?").get(update.to) as {id: number} | undefined;
  const fromCat = db.prepare("SELECT id FROM categories WHERE name = ?").get(update.from) as {id: number} | undefined;
  
  if (toCat && fromCat) {
    console.log(`  - 合并分类: ${update.from} -> ${update.to}`);
    db.prepare("UPDATE tech_items SET category_id = ? WHERE category_id = ?").run(toCat.id, fromCat.id);
    db.prepare("DELETE FROM categories WHERE id = ?").run(fromCat.id);
  } else if (fromCat && !toCat) {
    // 如果只有带空格的，改名为不带空格的
    db.prepare("UPDATE categories SET name = ? WHERE id = ?").run(update.to, fromCat.id);
  }
});

const categoriesDuplicates = db
  .prepare(
    `
  SELECT name, layer_id, MIN(id) as keep_id, COUNT(*) as cnt
  FROM categories
  GROUP BY name, layer_id
  HAVING cnt > 1
`,
  )
  .all();

interface CategoryDuplicateRow {
  name: string;
  layer_id: number;
  keep_id: number;
  cnt: number;
}

categoriesDuplicates.forEach((row: unknown) => {
  const duplicate = row as CategoryDuplicateRow;
  console.log(`  - 发现重复分类: ${duplicate.name} (保留 ID: ${duplicate.keep_id})`);

  // 将所有指向重复分类的技术项重新指向保留的分类
  db.prepare(`
    UPDATE tech_items 
    SET category_id = ? 
    WHERE category_id IN (
      SELECT id FROM categories WHERE name = ? AND layer_id = ? AND id != ?
    )
  `).run(duplicate.keep_id, duplicate.name, duplicate.layer_id, duplicate.keep_id);

  // 删除重复分类
  db.prepare(
    `
    DELETE FROM categories 
    WHERE name = ? AND layer_id = ? AND id != ?
  `,
  ).run(duplicate.name, duplicate.layer_id, duplicate.keep_id);
});

// 清理 tech_items 表的重复数据
console.log("\n清理 tech_items 表...");
const techItemsDuplicates = db
  .prepare(
    `
  SELECT name, category_id, MIN(id) as keep_id, COUNT(*) as cnt
  FROM tech_items
  GROUP BY name, category_id
  HAVING cnt > 1
`,
  )
  .all();

interface TechItemDuplicateRow {
  name: string;
  category_id: number;
  status: string;
  keep_id: number;
  cnt: number;
}

techItemsDuplicates.forEach((row: unknown) => {
  const duplicate = row as TechItemDuplicateRow;
  console.log(`  - 发现重复技术项: ${duplicate.name} (${duplicate.cnt} 条)`);
  db.prepare(
    `
    DELETE FROM tech_items 
    WHERE name = ? AND category_id = ? AND id != ?
  `,
  ).run(duplicate.name, duplicate.category_id, duplicate.keep_id);
});

// 显示清理后的统计
console.log("\n清理完成! 当前统计:");
const layersCount = db
  .prepare("SELECT COUNT(*) as count FROM layers")
  .get() as { count: number };
const categoriesCount = db
  .prepare("SELECT COUNT(*) as count FROM categories")
  .get() as { count: number };
const techItemsCount = db
  .prepare("SELECT COUNT(*) as count FROM tech_items")
  .get() as { count: number };

console.log(`  - Layers: ${layersCount.count}`);
console.log(`  - Categories: ${categoriesCount.count}`);
console.log(`  - Tech Items: ${techItemsCount.count}`);

db.close();
