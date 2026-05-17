# JWT Authentication Lab

## Deskripsi

Lab ini mensimulasikan sistem autentikasi berbasis JSON Web Token (JWT). Sistem menggunakan JWT untuk membedakan user biasa dan admin. Terdapat kelemahan pada konfigurasi secret key dan validasi algoritma token.

**Stack:** Node.js Express + jsonwebtoken  
**Port:** 6004

## Cara Bermain

1. Buka browser dan akses `http://localhost:6004`
2. Login menggunakan akun yang tersedia: `guest / guest123`
3. Setelah login, kamu akan mendapatkan sebuah JWT token
4. Coba akses admin panel dengan token yang kamu punya — apa yang terjadi?
5. Inspeksi token-mu dan cari tahu cara mendapatkan akses admin

## Hints

1. Setelah login, perhatikan token yang dikembalikan — coba decode di [jwt.io](https://jwt.io)
2. Token berisi field `role` — kamu perlu mengubahnya menjadi `admin`
3. Tapi kamu butuh secret key untuk menandatangani token baru... atau tidak?
4. Hint 1: Secret key yang digunakan sangat lemah — coba tebak atau brute-force
5. Hint 2: Apa yang terjadi jika kamu mengubah algoritma token menjadi `none`?

## Cara Kerja

Aplikasi menggunakan JWT (`jsonwebtoken` library) untuk autentikasi. Saat login, server membuat token dengan claim `role: user`. Endpoint admin mengecek apakah `role === admin`. Kelemahannya ada dua:
1. **Weak Secret**: Secret key sangat mudah ditebak (`secret`)
2. **Algorithm None**: Server menerima token dengan `alg: none`, yang berarti signature tidak diverifikasi

## Expected Learning Outcome

- Memahami struktur dan cara kerja JWT (Header, Payload, Signature)
- Memahami serangan JWT: weak secret dan algorithm confusion
- Mampu mendecode, memodifikasi, dan menandatangani ulang JWT
- Memahami pentingnya strong secrets dan algorithm whitelist dalam JWT implementation