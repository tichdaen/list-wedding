This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```sql
create table public.contributions (
  id bigserial primary key,
  display_order integer,
  name text not null,
  note text,
  amount integer not null,
  tag text,
  owner text,
  created_at timestamp with time zone default timezone('Asia/Seoul'::text, now())
);
```

### 트리거 ID 와 Display Order 같게 
```sql
create or replace function set_display_order()
returns trigger as $$
begin
  NEW.display_order := NEW.id;
  return NEW;
end;
$$ language plpgsql;

create trigger set_display_order_trigger
before insert on contributions
for each row
execute function set_display_order();
```

### Sequence 초기화
```sql
ALTER SEQUENCE contributions_id_seq RESTART WITH 1;
```

```sql
SELECT SUM(amount) from contributions
WHERE id > 20
```
