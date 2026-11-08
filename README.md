# İlmek: İlknur'un İlmekleri için Shopify teması

[@ilknurun.ilmeklerii](https://www.instagram.com/ilknurun.ilmeklerii) markası için sıfırdan yazılmış bir Shopify teması (Online Store 2.0). Marka el yapımı örgü, tığ işi ve amigurumi ürünleri satıyor.

## Tasarım dili
- **Renkler:** krem zemin, kiremit/terrakota vurgu, adaçayı yeşili ve pudra. Sıcak, el emeği hissi veren bir palet.
- **Yazı tipleri:** başlıklarda Lora (zarif, serif), metinlerde Nunito Sans (yumuşak, okunaklı).
- **Detaylar:** sadece CSS ile çizilmiş örgü dokusu deseni, yumak ikonları, kemerli görsel çerçeveleri, yumuşak giriş animasyonları.

## Kurulum
1. Bu repodaki dosyaları zip'le. Zip'in kökünde `layout`, `sections` gibi klasörler olmalı.
   ```bash
   zip -r ilmek-tema.zip assets config layout locales sections snippets templates
   ```
2. Shopify paneli → **Online Mağaza → Temalar → Tema ekle → Zip dosyası yükle**.
3. **Özelleştir**'e girip **Tema ayarları → İletişim ve WhatsApp** kısmından WhatsApp numarasını gir (örnek: `905551112233`).
4. Logoyu **Başlık** bölümünden yükle.

## Ana sayfa bölümleri
| Bölüm | Açıklama |
|---|---|
| Duyuru çubuğu | Sırayla değişen kampanya ve bilgi mesajları |
| Karşılama (Hero) | Yan yana veya tam ekran düzen, yuvarlak "Sipariş üzerine örülür" etiketi |
| Güven çubuğu | El yapımı, kaliteli iplik, hediye paketi, güvenli ödeme |
| Kategoriler | Yuvarlak kategori karoları (mobilde kaydırılabilir) |
| Öne çıkan ürünler | Koleksiyon seçince ürünleri gösterir, seçilmezse örnek kartlar görünür |
| Görsel ve metin | "Hikayemiz" ve imza |
| Nasıl hazırlanıyor | 4 adımlık süreç |
| Kişiye özel sipariş | WhatsApp ve Instagram DM butonları |
| Müşteri yorumları | Yıldızlı yorum kartları |
| Instagram galerisi | Gönderi görselleri ve takip butonu |
| Sık sorulan sorular | Hazırlanma süresi, bakım, kargo ve iade |
| E-bülten | Shopify müşteri listesine abone toplar |

Bütün bölümler tema düzenleyicide sürükle-bırak ile sıralanabilir, eklenip çıkarılabilir.

## Ürün sayfası
- Galeri: mobilde kaydırmalı, masaüstünde ızgara. Varyant seçilince o varyantın görseli öne gelir.
- Renk ve boyut seçimi. Stokta olmayan kombinasyonlar üstü çizili görünür.
- **Kişiselleştirme notu:** müşteri "isim işleme, renk" gibi isteğini yazar. Not siparişte ürün özelliği olarak görünür.
- **El yapımı bilgi kutusu** ve **hazırlanma süresi**. Ürüne özel süre için `custom.hazirlanma_suresi` adında tek satır metin metafield'ı oluşturabilirsin.
- "WhatsApp'tan sor" butonu: mesaj ürün adı ve linkiyle hazır açılır.
- Malzeme, bakım talimatı, kargo ve iade sekmeleri.
- Mobilde sayfa kaydırıldıkça altta sabit kalan "Sepete ekle" çubuğu.
- Benzer ürünler bölümü ve Google için ürün yapısal verisi (schema.org).

## Sepet
- Yan sepet. Sayfa yenilenmeden ekleme ve adet değiştirme yapılır.
- Ücretsiz kargo ilerleme çubuğu. Limit **Tema ayarları → Sepet** kısmından değiştirilir.
- Sipariş notu alanı.

## Diğer sayfalar
Koleksiyon (filtreleme ve sıralama), arama, sepet, blog, blog yazısı, sayfa, iletişim formu, hakkımızda (`page.about`), 404, şifre sayfası, hediye kartı ve müşteri hesap sayfaları. Tüm metinler Türkçe (`locales/tr.default.json`).

## Önerilen menüler
- **Ana menü (`main-menu`):** Yeni gelenler · Amigurumi · Bebek & Çocuk · Hırka & Yelek · Ev & Dekor · Kişiye özel · Hakkımızda
- **Alt menü (`footer`):** Hakkımızda · Kargo ve teslimat · İade koşulları · Gizlilik politikası · İletişim

Tema, Shopify'ın resmi denetim aracı Theme Check ile 0 hata verecek şekilde doğrulandı.
