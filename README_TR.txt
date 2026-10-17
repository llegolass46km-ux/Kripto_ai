KRİPTO AI — İLK ÇALIŞAN PROTOTİP

İÇERİK
- CoinGecko üzerinden otomatik fiyat, piyasa değeri, hacim ve geçmiş fiyat verileri
- 24 saat / 7 gün / 30 gün fiyat grafiği
- Basit RSI(14) ve EMA(12/26) göstergeleri
- Kural tabanlı otomatik teknik yorum
- Uygulama açıkken kontrol edilen fiyat alarmı
- TXT formatında rapor oluşturma
- Mobil uyumlu PWA iskeleti ve önbellek

ÖNEMLİ SINIRLAR
- Buradaki “AI yorumlama” gerçek bir büyük dil modeli değildir; ilk sürümde göstergelere dayalı açıklama kurallarıdır.
- Tahmin kesinliği iddia edilmez; gerçek tahmin modeli için geçmiş veriler, backtest ve ölçüm gerekir.
- Fiyat alarmı uygulama açıkken/yenileme çalışırken kontrol edilir. Arka planda güvenilir bildirim için sunucu ve Web Push altyapısı gerekir.
- CoinGecko ücretsiz erişim sınırları değişebilir; hata olursa daha sonra tekrar deneyin. İhtiyaca göre Demo API anahtarı gerekir.
- Uygulama otomatik alım/satım yapmaz ve borsa hesabınıza bağlanmaz.

NASIL DENEYEBİLİRSİN?
1) Bu klasörü HTTPS destekleyen bir statik web barındırma hizmetine yükle (ör. kendi hosting'in).
2) index.html adresini Android Chrome'da aç.
3) Tarayıcı menüsünden “Ana ekrana ekle” veya “Uygulamayı yükle” seçeneğini kullan.
4) İnternet bağlantısını açık tut; veriler CoinGecko API'den alınır.

Yerel test için bilgisayarda bu klasörde:
  python -m http.server 8000
Sonra aynı ağdaki telefonda bilgisayarın yerel IP adresiyle :8000 portunu açabilirsin. PWA kurulumu ve bildirimler için genellikle HTTPS gerekir (localhost istisnası vardır).

GELİŞTİRME YOL HARİTASI
1. CoinGecko API anahtarını güvenli bir sunucu tarafına taşıma (anahtarı HTML/JS içine koyma).
2. Gerçek AI yorumlama için backend üzerinden model API'si bağlama.
3. Geçmiş veriler üzerinde walk-forward backtest, MAE/RMSE ve yön doğruluğu ölçümü.
4. Sunucu tabanlı zamanlanmış alarm + Web Push bildirimleri.
5. İsteğe bağlı portföy, risk profili ve çoklu varlık izleme.


GERÇEK YAPAY ZEKÂ EKLENTİSİ (TAMAMEN ÜCRETSİZ YAKLAŞIM)
- index.html içinde “AI modelini yükle” düğmesine basılınca Transformers.js, tarayıcıya küçük bir metin üretim modeli indirir.
- Model seçimi: onnx-community/Qwen2.5-0.5B-Instruct; modelin dosyaları ilk kullanımda yüzlerce MB olabilir (değişebilir).
- Uyumlu cihazlarda WebGPU, diğer durumlarda WASM/CPU kullanılır. Android telefonlarda yavaşlık, bellek yetersizliği veya model uyumsuzluğu yaşanabilir.
- Model indirme ve çalıştırma ücretsizdir; internet/veri kullanımı vardır. Bu yaklaşım bulut API anahtarı gerektirmez ve piyasa verilerini bir AI API sağlayıcısına göndermeden yorum üretir.
- Model ve runtime CDN/Hugging Face üzerinden yüklenir; bu nedenle ilk yüklemede internet gerekir. Gerçekten çevrimdışı çalışma, dosyalar önceden indirilip uygulamayla paketlenirse ayrıca yapılandırılmalıdır.
- Tarayıcıda ES module, WASM ve tercihen WebGPU desteklenmelidir. HTTPS barındırma kullanın.
- Model çıktılarını kesin fiyat tahmini veya yatırım tavsiyesi olarak kullanmayın. Dil modeli istatistiksel tahmin modeli değildir; teknik verileri açıklaması için kullanılır.
- Model yükleme başarısız olursa temel grafik/teknik göstergeler AI olmadan çalışmaya devam eder.

Bu AI eklentisi ilk kez çalıştırıldığında cihazda performans testi yapılmalıdır. Model kimliği/depo dosyaları zamanla değişebileceğinden, üretime geçmeden önce gerçek cihazda doğrulayın.


AI NOTU: Modelin gerçek cihazda indirilip çalışması bu çalışma ortamında Android üzerinde test edilmedi. İlk çalıştırma sırasında model deposu/cihaz kısıtları nedeniyle hata alınırsa, alternatif model kimliği ve sürümüyle test edilmelidir.
