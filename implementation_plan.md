# Implementation Plan: Dynamic Category & Payment Method System

## Goal
Transform the hardcoded categories into a dynamic system managed by the user. Transactions will now track: **Type**, **Payment Method**, **Category**, and **Subcategory**.

## Required User Action: Database Migration
Before I can write the React code, we must update the Supabase database. You need to run the following SQL script in your **Supabase Dashboard -> SQL Editor**. 

> [!IMPORTANT]
> This script will create 3 new tables, insert your requested templates as initial data, and update the `transactions` table. It also sets up Row Level Security (RLS) so the app can read/write them.
> **Note:** If you have important data in your `transactions` table, this script safely adds new columns. Old transactions won't be deleted, but they won't seamlessly migrate to the new format (which is fine for a fresh setup or early stage).

```sql
-- 1. Create Payment Methods Base Table
CREATE TABLE payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  method_type TEXT NOT NULL CHECK (method_type IN ('cash', 'cashless')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Categories Base Table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'outcome')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Subcategories Table
CREATE TABLE subcategories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Alter Transactions Table
ALTER TABLE transactions 
  ADD COLUMN IF NOT EXISTS payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL;

-- 5. Insert Template Data (Payment Methods)
INSERT INTO payment_methods (name, method_type) VALUES 
('Dompet/Cash', 'cash'),
('Gopay', 'cashless'),
('OVO', 'cashless'),
('Dana', 'cashless'),
('SeaBank', 'cashless');

-- 6. Insert Template Data (Categories & Subcategories)
-- We use a DO block to easily insert categories and grab their IDs for subcategories
DO $$
DECLARE
  cat_id UUID;
BEGIN
  -- INCOME CATEGORIES
  INSERT INTO categories (name, type) VALUES ('Sumber Pemasukan', 'income') RETURNING id INTO cat_id;
  INSERT INTO subcategories (category_id, name) VALUES 
    (cat_id, 'Ibu'), (cat_id, 'Ayah'), (cat_id, 'Kakak'), (cat_id, 'Teman'), (cat_id, 'Gaji');

  -- OUTCOME CATEGORIES
  INSERT INTO categories (name, type) VALUES ('Pendidikan/Sekolah', 'outcome') RETURNING id INTO cat_id;
  INSERT INTO subcategories (category_id, name) VALUES 
    (cat_id, 'Jajan sekolah'), (cat_id, 'Ongkos perjalanan'), (cat_id, 'Pengeluaran tak terduga');

  INSERT INTO categories (name, type) VALUES ('Me Time', 'outcome') RETURNING id INTO cat_id;
  INSERT INTO subcategories (category_id, name) VALUES 
    (cat_id, 'Fashion'), (cat_id, 'Online shop'), (cat_id, 'Skincare'), (cat_id, 'Jalan-jalan sendiri'), (cat_id, 'Olahraga'), (cat_id, 'Pengeluaran tak terduga');

  INSERT INTO categories (name, type) VALUES ('Sosial/Diluar Sekolah', 'outcome') RETURNING id INTO cat_id;
  INSERT INTO subcategories (category_id, name) VALUES 
    (cat_id, 'Jajan di luar sekolah'), (cat_id, 'Ongkos perjalanan'), (cat_id, 'My Trip My Adventure'), (cat_id, 'Pengeluaran tak terduga');
END $$;

-- 7. Enable RLS and Policies
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on payment_methods" ON payment_methods FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on subcategories" ON subcategories FOR ALL USING (true) WITH CHECK (true);
```

## Proposed Frontend Changes

### Phase 1: New Component `Settings.jsx`
- Access via a new "⚙️ Pengaturan" button in the Top Header (`App.jsx`).
- Renders tables to view `payment_methods`, `categories`, and `subcategories`.
- Forms to add/edit/delete these lists. (e.g. Adding a new e-wallet or a new subcategory).

### Phase 2: Transaction Dropdowns Update
- Fetch dynamic lists from Supabase instead of importing `categories.js`.
- **`TransactionForm.jsx` / `EditModal.jsx`**:
  - Add dropdown for **Metode Pembayaran**.
  - Dropdown **Kategori** filters down based on Type.
  - Dropdown **Sub-kategori** is populated only with children of the selected Category.
- Update insert/update logic to send IDs (`payment_method_id`, `category_id`, `subcategory_id`).

### Phase 3: Dashboard & Chart Update
- Modify Supabase query in `App.jsx` to select joined tables: `payment_methods(name), categories(name), subcategories(name)`.
- Update `TransactionList.jsx` to render this richer data gracefully.
