# Insecure Direct Object References (IDOR)

## Deskripsi

Lab ini mensimulasikan sistem profil pengguna dengan API endpoint yang menggunakan ID numerik. Tidak ada pengecekan otorisasi — siapapun bisa melihat profil pengguna lain hanya dengan mengubah ID di URL.

**Stack:** Node.js Express  
**Port:** 6003

## Cara Bermain

1. Buka browser dan akses `http://localhost:6003`
2. Kamu akan melihat profil User #1 (Alice)
3. Perhatikan ada input field "User ID" — coba ubah nilainya
4. Coba temukan semua user yang ada di sistem
5. Apakah ada user spesial yang menyimpan informasi rahasia?

## Hints

1. Ada 5 user di sistem ini (ID 1 sampai 5)
2. API endpoint-nya ada di `/api/users/:id`
3. Tidak ada pengecekan apakah kamu berhak melihat profil orang lain
4. Salah satu user memiliki role khusus — coba cari yang mana
5. Flag tersimpan di bio salah satu user dengan role tertinggi

## Cara Kerja

Aplikasi memiliki endpoint `/api/users/:id` yang mengembalikan data profil pengguna berdasarkan ID tanpa melakukan pengecekan otorisasi. Siapapun yang mengetahui endpoint ini bisa mengakses data semua pengguna hanya dengan mengubah parameter ID.

## Expected Learning Outcome

- Memahami konsep Insecure Direct Object References (IDOR)
- Memahami pentingnya access control pada API endpoint
- Mampu melakukan enumerasi resource melalui ID
- Memahami bahwa UI restrictions bukan pengganti server-side authorization