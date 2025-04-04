/*
  Warnings:

  - A unique constraint covering the columns `[name,subcategory]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Category_name_subcategory_key" ON "Category"("name", "subcategory");

-- CreateIndex
CREATE INDEX "Product_categoryName_idx" ON "Product"("categoryName");

-- CreateIndex
CREATE INDEX "Product_subcategoryName_idx" ON "Product"("subcategoryName");
