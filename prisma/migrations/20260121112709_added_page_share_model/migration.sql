-- CreateTable
CREATE TABLE "page_share" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "IsPublic" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_share_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "page_share_pageId_key" ON "page_share"("pageId");

-- AddForeignKey
ALTER TABLE "page_share" ADD CONSTRAINT "page_share_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
