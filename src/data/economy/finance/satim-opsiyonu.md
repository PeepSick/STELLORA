---
title: Satım_opsiyonu
url: 
tags: ["dayanak", "opsiyonu", "displaystyle", "satım", "opsiyon", "fiyat", "opsiyonun", "değeri"]
fetched_at: 2026-06-04T21:04:33.872Z
source: hamdata
sector: "economy"
sub_sector: "finance"
confidence: verified
confidence_score: 0.77
fusion_at: "2026-06-04T22:29:39.181Z"
quality_layer: 2
quality_score: 0.77
quality_density: 0.777
quality_vocab: 0.551
sector_hint: science
---

# Satım_opsiyonu

Finansta satım opsiyonu alıcısına ya da sahibine sözleşmede belirtilen miktardaki bir malı veya finansal varlığı, gene sözleşmede belirtilen belirli bir vadede ya da tarihte, nasıl hesaplanacağı ya da ne olduğu anlaşılmış bir fiyattan satma hakkı veren, ama satma yükümlülüğü doğurmayan opsiyon sözleşmesidir. Buna karşılık, opsiyonun satıcısı ya da başka bir deyişle opsiyonun yazıcısı, sözleşmeden doğan yükümlülükleri karşılayacağı vaadiyle alıcıdan bir opsiyon primi alır. Opsiyon priminin ne zaman ödeneceği yine sözleşmede anlaşılan konulardan biridir.
Bir satım opsiyonunun alınması, dayanak varlık olan hisse senedinin gelecekteki değeri hakkında olumsuz bir his olarak yorumlanır. BU tür opsiyonlar ayrıca daha karmaşık yatırım stratejilerinin bir parçası olarak diğer türevlerle birleştirilebilir ve özellikle riskten korunma için yararlı olabilir.
Satım opsiyonları, borsada genellikle dayanak varlığın hisse senedi olduğu durumlarda, payın spot fiyatının belirli bir fiyat seviyesinin altına düşmesine karşı koruma sağlamak için kullanılır. Payın fiyatı kullanım fiyatının altına düşerse, satım opsiyonu sahibi dayanak varlığı kullanım fiyatından satma hakkına sahiptir ancak satma yükümlülüğü yoktur. Satım opsiyonu satıcısı ise alıcı hakkını kullandığında varlığı kullanım fiyatından satın alma yükümlülüğüne sahiptir. Bu şekilde, satış opsiyonu alıcısı, varlık şu anda değersiz olsa bile en azından belirtilen satış fiyatını alacaktır.

Dayanak varlık
Opsiyon sözleşmesine konu olan ve opsiyon priminin hesaplanmasında referans alınan mal ya finansal varlığa dayanak varlık da denir. Dayanak varlıklar pay (hisse senedi), pay endeksi ya da volatilite endeksi gibi karmaşık endeksler, döviz ikilisi, tahvil, faiz oranı, vadeli işlemler sözleşmeleri ve emtia başta olmak üzere çeşitli finansal varlıklara işaret edebilirler. Örneğin, Vadeli İşlemler ve Opsiyon Piyasası altında standard işlem gören opsiyonların dayanak varlıkları pay, endeks, mini endeks, döviz ikilisi (ABD Doları/Türk Lirası kuru gibi) gibi çeşitliliğe sahiptir.

Hakların kullanılması
Eğer opsiyonun vadesi 
 
 
 
 K
 
 
 {\displaystyle K}
 
 ise ve 
 
 
 
 t
 
 
 {\displaystyle t}
 
 anında dayanak varlığın spot fiyatı 
 
 
 
 
 S
 
 t
 
 
 
 
 {\displaystyle S_{t}}
 
 ise, o zaman bir Amerikan opsiyonunda alıcı, opsiyonun vade tarihi 
 
 
 
 T
 
 
 {\displaystyle T}
 
'ye kadar herhangi bir zamanda 
 
 
 
 K
 −
 
 S
 
 t
 
 
 
 
 {\displaystyle K-S_{t}}
 
 ödenişi karşılığında opsiyonu kullanabilir. Satım opsiyonu, yalnızca dayanak varlığın spot fiyatı kullanım fiyatının altına düşerse ve haklar kullanıldığında pozitif getiri sağlar. Bir Avrupa opsiyonu için haklar yalnızca 
 
 
 
 T
 
 
 {\displaystyle T}
 
 tarihinde kullanılabilir. Bir Bermuda opsiyonunda haklar yalnızca sözleşmede listelenen belirli tarihlerde kullanılabilir. Opsiyon vade tarihine kadar kullanılmazsa değersiz olarak sona erer. Alıcı, dayanak varlığın fiyatı 
 
 
 
 K
 
 
 {\displaystyle K}
 
'den büyükse genellikle izin verilen tarihte opsiyondan doğan haklarını kullanmaz.
Değerleme yaparken göz önüne alınan temel noktalar arasında şu faktörler vardır:

Opsiyonun içsel değerinin beklenen değeri; yani, Avrupa tipli bir satım opsiyonundaki kullanım fiyatı 
 
 
 
 K
 
 
 {\displaystyle K}
 
 ve dayanak varlığın 
 
 
 
 T
 
 
 {\displaystyle T}
 
 vadesindeki spot fiyatı 
 
 
 
 
 S
 
 T
 
 
 
 
 {\displaystyle S_{T}}
 
 ise 
 
 
 
 max
 (
 K
 −
 
 S
 
 T
 
 
 ,
 0
 )
 
 
 {\displaystyle \max(K-S_{T},0)}
 
 fonksiyonunun beklenen değeri gözetilir.
opsiyon değerinin belirlenemezliğini tazmin etmek için hesplanılan risk primi
paranın zaman değeri
Satım opsiyonu sözleşmesinin fiyatı genellikle vadeye kalan süre daha çok olduğunda (önemli bir temettünün mevcut olduğu durumlar hariç) ve dayanak varlığın oynaklığının daha fazla olduğu veya dayanak varlık hakkında başka bir öngörülemezlik tespit edildiğinde daha yüksek olacaktır. Bu değeri belirlemek finansal matematiğin temel işlevlerinden biridir. Kullanılan en yaygın yöntem, Avrupa tipi opsiyonların fiyatının analitik bir formülünün elde edilmesini sağlayan Black-Scholes modeli ya da Black 76 modelleridir. Bu modellerin sonucunda Black-Scholes formülü ve Black formülü elde edilir.

Ayrıca bakınız
Örtülü opsiyon
Opsiyon kârlılığı
Çıplak alım opsiyonu
Çıplak satım opsiyonu
Opsiyonun zaman değeri
Alım opsiyonu
Alım-satım paritesi

== Kaynakça ==
