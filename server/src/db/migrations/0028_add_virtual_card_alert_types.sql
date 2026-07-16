-- New alert types for the virtual card use simulation's success/failure paths.
ALTER TABLE alerts DROP CONSTRAINT alerts_type_check;
ALTER TABLE alerts
  ADD CONSTRAINT alerts_type_check
  CHECK (
    type = ANY (
      ARRAY[
        'payment_approved', 'payment_blocked', 'budget_exceeded', 'max_transaction_exceeded',
        'daily_limit_exceeded', 'monthly_limit_exceeded', 'merchant_not_allowed', 'blocked_category',
        'pin_required', 'wallet_expired', 'wallet_disabled', 'policy_disabled', 'insufficient_wallet_balance',
        'payment_completed', 'virtual_card_use_failed'
      ]
    )
  );
