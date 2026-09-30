-- CreateTable
CREATE TABLE "ShippingRate" (
    "id" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT '',
    "cost" INTEGER NOT NULL,
    "etaLabel" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShippingRate_department_city_key" ON "ShippingRate"("department", "city");
