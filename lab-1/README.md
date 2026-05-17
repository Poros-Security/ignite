# Local File Inclusion (LFI)

## Deskripsi

Lab ini mensimulasikan aplikasi file viewer yang memiliki kerentanan Local File Inclusion. Aplikasi membaca isi file berdasarkan parameter `file` dari URL, namun filter yang diterapkan tidak cukup kuat.

**Stack:** PHP 8.2 Alpine  
**Port:** 6001

## Cara Bermain

1. Buka browser dan akses `http://localhost:6001`
2. Coba masukkan nama file yang tersedia: `welcome.txt`, `about.txt`, `contact.txt`
3. Perhatikan bagaimana aplikasi membaca file melalui parameter `?file=`
4. Coba akses file di luar direktori yang seharusnya

## Hints

1. Perhatikan bagaimana input kamu diproses — ada filter, tapi apakah filter-nya sempurna?
2. Apa yang terjadi jika kamu mencoba `....//` alih-alih `../`?
3. Flag tersimpan di `/flag.txt` — di luar web directory
4. Coba buat path traversal yang lolos dari blacklist filter

## Cara Kerja

Aplikasi menggunakan parameter `file` untuk membaca file dari direktori `/var/www/html/files/`. Terdapat blacklist sederhana yang memblokir string `../` dan beberapa path sensitif. Namun, filter ini bisa di-bypass karena hanya melakukan pengecekan string sekali — tidak rekursif.

## Expected Learning Outcome

- Memahami konsep Local File Inclusion (LFI)
- Memahami kelemahan blacklist-based filtering
- Mampu melakukan path traversal bypass
- Memahami pentingnya whitelist-based input validation