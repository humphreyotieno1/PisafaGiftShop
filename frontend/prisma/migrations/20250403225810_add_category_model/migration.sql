/*
  Warnings:

  - You are about to drop the column `category` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `subcategory` on the `Product` table. All the data in the column will be lost.
  - Added the required column `categoryName` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subcategoryName` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Product_category_idx";

-- DropIndex
DROP INDEX "Product_subcategory_idx";

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subcategory" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- Create categories from existing products
INSERT INTO "Category" (id, name, subcategory, "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    category,
    subcategory,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM (
    SELECT DISTINCT category, subcategory
    FROM "Product"
) AS unique_categories;

-- Add temporary columns
ALTER TABLE "Product" 
ADD COLUMN "categoryName" TEXT,
ADD COLUMN "subcategoryName" TEXT,
ADD COLUMN "categoryId" TEXT;

-- Update temporary columns
UPDATE "Product" p
SET 
    "categoryName" = p.category,
    "subcategoryName" = p.subcategory,
    "categoryId" = c.id
FROM "Category" c
WHERE p.category = c.name AND p.subcategory = c.subcategory;

-- Drop old columns
ALTER TABLE "Product" DROP COLUMN "category";
ALTER TABLE "Product" DROP COLUMN "subcategory";

-- Make new columns required
ALTER TABLE "Product" 
ALTER COLUMN "categoryName" SET NOT NULL,
ALTER COLUMN "subcategoryName" SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
