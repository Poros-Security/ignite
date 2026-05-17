# SQL Injection

## Deskripsi

Lab ini mensimulasikan sistem login yang menggunakan database SQLite. Query login dibuat dengan string concatenation tanpa prepared statement, sehingga rentan terhadap SQL injection. Terdapat filter ringan yang memblokir beberapa payload umum.

**Stack:** PHP 8.2 Alpine + SQLite  
**Port:** 6002

## Cara Bermain

1. Buka browser dan akses `http://localhost:6002`
2. Kamu akan melihat form login dengan username dan password
3. Coba login dengan kredensial biasa — apakah kamu bisa masuk?
4. Perhatikan bagaimana input diproses dan coba cari cara untuk masuk sebagai admin

## Hints

1. Aplikasi menggunakan SQLite — query-nya mungkin mirip: `SELECT * FROM users WHERE username = '...' AND password = '...'`
2. Ada filter yang memblokir `--`, `OR 1=1`, dan beberapa pattern lain
3. Tapi filter-nya case-sensitive dan tidak memblokir semua variasi
4. Coba pikirkan: bagaimana caranya membuat kondisi `WHERE` selalu bernilai true tanpa menggunakan komentar SQL?
5. Hint: `' OR '1'='1` — perhatikan posisi quote-nya

## Cara Kerja

Form login mengambil input username dan password, lalu menyusun query SQL secara langsung menggunakan string concatenation. Meskipun ada blacklist filter, filter tersebut hanya mengecek beberapa pattern spesifik dan bersifat case-sensitive, sehingga bisa di-bypass.

## Expected Learning Outcome

- Memahami konsep SQL Injection pada form login
- Memahami kelemahan string concatenation dalam query SQL
- Mampu mem-bypass filter sederhana
- Memahami pentingnya prepared statements / parameterized queries