# Coverage

## What is covered

| Feature   | Covered                                                                                       | File                          |
| --------- | --------------------------------------------------------------------------------------------- | ----------------------------- |
| Login     | Protected page redirects to `/login?next=`, wrong password, empty form, successful login      | `auth/auth.spec.ts`           |
| Sign out  | Sign out returns to `/login`                                                                  | `auth/auth.spec.ts`           |
| Dashboard | Loading text first, then the numbers                                                          | `dashboard.spec.ts`           |
| Products  | List with 10 rows and count, search by name, status filter                                    | `products/products.spec.ts`   |
| Products  | Create through the form, validation errors on each field                                     | `products/products.spec.ts`   |
| Products  | Delete with confirm, cancel keeps the product                                                 | `products/products.spec.ts`   |
| Orders    | Status filter, admin marks a pending order as paid                                            | `orders/orders.spec.ts`       |

## Not covered yet

These gaps are left on purpose. Pick one and write the test.

- Editing a product.
- Pagination: the Next and Previous buttons.
- Duplicate SKU error when creating a product.
- The viewer role: no New, Edit or Delete buttons, and the API answers 403.
- Cancelling an order.
- Marking a paid order as shipped.
- The order filter empty state ("No orders with this status.").
- The 404 page for an unknown product id.
- Returning to the `?next=` page after login.
