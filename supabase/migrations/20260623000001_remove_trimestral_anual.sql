-- Mark Trimestral and Anual as inactive to preserve existing membership references
UPDATE membership_types SET is_active = false WHERE name IN ('Trimestral', 'Anual');
