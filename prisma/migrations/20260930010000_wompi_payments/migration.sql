-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'pendiente',
ADD COLUMN     "wompiReference" TEXT,
ADD COLUMN     "wompiTransactionId" TEXT;

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- CreateIndex
CREATE UNIQUE INDEX "Order_wompiReference_key" ON "Order"("wompiReference");

-- CreateIndex
CREATE UNIQUE INDEX "Order_wompiTransactionId_key" ON "Order"("wompiTransactionId");

