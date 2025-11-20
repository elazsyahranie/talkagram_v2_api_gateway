-- CreateTable
CREATE TABLE "Companies" (
    "id" VARCHAR(255) NOT NULL,
    "user_id" TEXT NOT NULL,
    "code" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Companies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Companies_user_id_key" ON "Companies"("user_id");

-- AddForeignKey
ALTER TABLE "Companies" ADD CONSTRAINT "Companies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
