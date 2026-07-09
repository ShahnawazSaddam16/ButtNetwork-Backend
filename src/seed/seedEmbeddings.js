require("dotenv").config();
const fs = require("fs");
const path = require("path");
const supabase = require("../config/supabaseClient");
const { generateEmbedding } = require("../utils/embeddings");

const run = async () => {
  const filePath = path.join(__dirname, "../data/company-data.json");
  const rawData = fs.readFileSync(filePath, "utf-8");
  const entries = JSON.parse(rawData);

  for (const entry of entries) {
    const embedding = await generateEmbedding(entry.content);

    const { error } = await supabase.from("documents").upsert({
      id: entry.id,
      category: entry.category,
      content: entry.content,
      embedding,
    });

    if (error) {
      console.error(`Failed to insert ${entry.id}`, error);
    } else {
      console.log(`Inserted ${entry.id}`);
    }
  }

  console.log("Seeding complete");
};

run();