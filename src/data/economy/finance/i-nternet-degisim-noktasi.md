---
title: İnternet_değişim_noktası
url: 
tags: ["için", "daha", "diğer", "internet", "arasında", "olan", "direkt", "değişim"]
fetched_at: 2026-06-04T21:06:06.063Z
source: hamdata
sector: "economy"
sub_sector: "finance"
confidence: verified
confidence_score: 0.785
fusion_at: "2026-06-04T22:29:38.886Z"
quality_layer: 2
quality_score: 0.785
quality_density: 0.761
quality_vocab: 0.625
sector_hint: geography
---

# İnternet_değişim_noktası

Internet değişim noktası (Internet Exchange Point – IXP ), farklı İnternet servis sağlayıcılarının (Internet Service Provider – ISP ), karşılıklı denklik anlaşmalarına göre, kendi ağları arasında İnternet trafiği değişimini ücretsiz olarak gerçekleştirmelerini sağlayan fiziksel bir altyapıdır. IXP'ler ISP 'lerin upstream transit sağlayıcıları aracığılıyla teslim etmesi gereken trafik miktarını düşürür, dolayısıyla servislerinin Her Bit için Ortalama Teslim Maliyeti (Average Per-Bit Delivery Cost ) de azalır. Ayrıca, IXP üzerinden keşfedilen yolların artan sayısı yönlendirme (routing) verimini arttırır, hata toleransını gelişmesini sağlar.

Bir IXP'nin başlıca amacı bilgisayar ağlarının bir ya da daha fazla üçüncü parti ağları kullanmadan santral aracılığı ile birbirleriyle iletişim kurmasını sağlamaktır.Ağların birbirleriyle direkt iletişiminin çok çeşitli avantajları vardır; ama bu noktada başlıca nedenler maliyet, gecikme ve bant genişliğidir. Mesela, ISP 'nin upstream sağlayıcısına doğru gerçekleşen trafiğin ücretlendirilmesi yapılırken, bir santral üzerinden direkt bağlantı olarak gerçekleştirilen trafik geçişi herhangi bir topluluk tarafından ücretlendirilmez. Ağlar arasında gerçekleştirilen direkt bağlantı ki çoğu zaman bu her iki ağ aynı şehirde olmaktadır, veriye erişim için diğer şehirlere ki muhtemelen farklı kıtalarda, bir ağdan diğer ağa iletimi için gezinme ihtiyacını ortadan kaldırıyor, bu yüzden de gecikmenin düşmesi söz konusu. Üçüncü avantaj olarak hız ise yetersiz şekilde gelişmiş uzun-mesafe bağlantılarına sahip alanlarda en çok fark edilen özelliktir. Bu bölgedeki ISP 'ler, Kuzey Amerika, Avrupa ya da Japonya'daki ISP 'lere göre veri transferi için 10 ya da 100 kat arasında değişen oranlarda daha fazla ödemek zorunda kalabiliyor. Bu yüzden, bu tür ISP 'ler İnternetin geri kalanına tipik olarak daha yavaş, daha limitli erişimlere sahiptir. Buna rağmen, yerel bir IXP'ye olan bağlantı, onlara yakın komşu ISP 'lerin müşterileri arasında limitsiz ve masrafsız veri transfer etme imkânı sağlayabilir.
Klasik bir IXP, her bir ISP 'nin bağlantısına ortak olduğu bir ya da daha fazla ağ anahtarından oluşur. Anahtarların varlığından önce IXP'ler FOIRL hub'ları ya da FDDI ring'lerinden başlayarak daha sonra 1993 ve 1994'te kullanılabilir olmalarıyla birlikte Ethernet ve FDDI anahtarlarına geçiş yaparak bu arabirimlerden yararlandılar. ATM anahtarları 1990'ların sonuna doğru kısa bir süreliğine birkaç IXP'lerde kullanılmışlardı, en yoğun durumlarında pazarın yaklaşık olarak %4'ünü yönetiyorlardı ve Stockholm IXP'si NetNod tarafından SRP/DPT (FDDI ile SONET 'in başarısız birleşimi) kullanmak amacıyla gerçekleştirilmiş verimsiz bir girişim vardı; ama galip gelen, var olan tüm İnternet santral yapısının %95'inden fazlasını yöneten Ethernet oldu. Tüm Ethernet portlarının hızları küçük boyutlu gelişen ülke IXP'lerinin 10 Mbit/s sinden; Seul, New York, Londra, Frankfurt, Amsterdam ve Palo Alto gibi büyük merkezlerin birleşik 10 Gbit/s sine kadar genişleyen bir yelpazede modern IXP'lerde yerini alacaktır.
Eğer bir IXP herhangi bir işletim maliyeti yaratırsa, bu genellikle santralin ortakları arasında paylaşılır. Daha pahalı santrallerde katılımcılar aylık ya da yıllık ücret öderler. Bu ücret, kullandıkları port ya da portların hızları ile ya da daha az yaygın olmakla birlikte santral üzerinden geçirdikleri trafiğin miktarı ile belirlenir. Trafiğin miktarına dayalı ücretler tercih edilmemektedir; çünkü bunlar santralin gelişmesine olan teşvike engel teşkil etmektedirler. Bazı santraller anahtar portları ve yeni ortakların talep ettiği herhangi bir ortam adaptörünün (GBIC s, SFP s, XFP s, XENPAK s vb.) maliyetini dengelemek ve servis vermesi için verilen yapılandırma hizmeti için ayrıca kurulum ücretine de sahiptir.

IXP Üzerindeki Trafiğin Değişimi
IXP'ye olan bağlantının kendisi değişim yapılacak herhangi bir trafiğe neden olmaz. Bu, paylaşılan bir ortam üzerindeki fiziksel varlıktan başka bir şey değildir.
Bir IXP üzerindeki iki katılımcı arasında Internet trafik akışına sahip olmak için aralarında BGP paylaşımını başlatmalı ve paylaşım ilişkisi üzerindeki hattı anons etmek için seçmelidir. Bu hatlar kendi adreslerine olabildiği gibi muhtemelen diğer mekanizmalarla birbirine bağlanan ISP 'lerin adreslerine olan hatlar da olabilir. Paylaşımda olan diğer grup kabul ettiği bu hatlar için yönlendirme (routing) filtrelemesi gerçekleştirebilir ve buna bağlı olarak trafiği yönlendirebilir. Ya da bu yolları reddebilir ve bu adrese ulaşmak için diğer yolları kullanır.
Birçok durumda, bir ISP diğer ISP 'ye hem direkt linke sahip olacaktır hem de, genellikle reddedilen, IXP üzerinden diğer ISP 'ye giden bir hat kabul edecektir. Eğer direkt link hata oluşturursa trafik daha sonra IXP üzerinde akmaya başlar. Bu durumda IXP bir çeşit destekleme linki olarak davranır.

Ayrıca bakınız
Belirli Internet Değişim Noktaları (IXP) Listesi
Yoğunluğuna Göre Internet Değişim Noktaları (IXP)
