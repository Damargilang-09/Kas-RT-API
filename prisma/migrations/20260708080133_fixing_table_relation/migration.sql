-- AddForeignKey
ALTER TABLE "Income" ADD CONSTRAINT "Income_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
