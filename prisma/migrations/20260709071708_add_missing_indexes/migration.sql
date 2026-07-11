-- CreateIndex
CREATE INDEX "Expenses_images_expenses_id_idx" ON "Expenses_images"("expenses_id");

-- CreateIndex
CREATE INDEX "Income_created_by_idx" ON "Income"("created_by");

-- CreateIndex
CREATE INDEX "Income_period_year_period_month_idx" ON "Income"("period_year", "period_month");

-- CreateIndex
CREATE INDEX "bills_batch_id_idx" ON "bills"("batch_id");

-- CreateIndex
CREATE INDEX "cash_transactions_source_id_source_type_idx" ON "cash_transactions"("source_id", "source_type");

-- CreateIndex
CREATE INDEX "cash_transactions_period_year_period_month_idx" ON "cash_transactions"("period_year", "period_month");

-- CreateIndex
CREATE INDEX "expenses_period_year_period_month_idx" ON "expenses"("period_year", "period_month");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");
