import { mutation } from "./_generated/server";

/**
 * Irreversibly deletes all data from merchants, products, and product_variants tables.
 */
export const clearAllData = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting full data wipe...");

    // 1. Delete all merchant records
    const merchants = await ctx.db.query("merchants").collect();
    for (const m of merchants) {
      await ctx.db.delete(m._id);
    }
    console.log(`Deleted ${merchants.length} merchants.`);

    // 2. Delete all product records
    const products = await ctx.db.query("products").collect();
    for (const p of products) {
      await ctx.db.delete(p._id);
    }
    console.log(`Deleted ${products.length} products.`);

    // 3. Delete all product_variants records
    const variants = await ctx.db.query("product_variants").collect();
    for (const v of variants) {
      await ctx.db.delete(v._id);
    }
    console.log(`Deleted ${variants.length} product variants.`);

    return "All merchant, product, and variant data has been permanently cleared.";
  },
});
