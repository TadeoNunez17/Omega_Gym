-- Fix Visita payment amount that was recorded with wrong price ($320 instead of $30)
UPDATE payments
SET amount = 30.00
WHERE id = 'c2a98188-674c-4faa-8421-ca687ccbf5c0'
  AND amount = 320.00;
