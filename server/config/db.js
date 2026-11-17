const supabase = require("./supabase");

const connectDB = async () => {
  // Fire a lightweight query to verify the Supabase connection is live.
  // maybeSingle() returns null instead of an error when the table is empty,
  // so this is safe even on a brand-new project.
  const { error } = await supabase
    .from("users")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase connection failed: ${error.message}`);
  }

  console.log("✅ Supabase (PostgreSQL) Connected Successfully");
};

module.exports = connectDB;
