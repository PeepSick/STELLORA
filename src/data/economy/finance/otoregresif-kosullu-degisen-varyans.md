---
title: Otoregresif_koşullu_değişen_varyans
url: 
tags: ["displaystyle", "alpha", "arch", "hata", "sigma", "varyans", "epsilon", "koşullu"]
fetched_at: 2026-06-04T21:04:11.135Z
source: hamdata
sector: "economy"
sub_sector: "finance"
confidence: verified
confidence_score: 0.69
fusion_at: "2026-06-04T22:29:39.110Z"
quality_layer: 2
quality_score: 0.69
quality_density: 0.551
quality_vocab: 0.454
sector_hint: geography
---

# Otoregresif_koşullu_değişen_varyans

Ekonometride Otoregresif koşullu değişen varyans ya da ARCH modeli, zaman serilerinde (özellikle finansal getiri serilerinde) gözlemlenen oynaklık kümelenmesini modellemek için geliştirilmiş istatiksel bir yöntemdir. Model, 1982 yılında Robert F. Engle tarafından geliştirilmiş ve finansal ekonometride devrim yaratmıştır. Robert F. Engle ARCH modeli üzerine çalışmasından ötürü 2003'te Nobel Ekonomi Ödülü’nü almıştır.
ARCH modelinde klasik zaman serisi çalışmalarında uygulanan Hata teriminin varyansı sabittir (homoskedastisite) varsayımının yerine, hata teriminin varyansı, geçmiş dönemdeki hata karelerine bağlı olarak zamanla değişir varsayımı (koşullu heteroskedastisite) getirilmiştir.
ARCH modelleri, hisse senedi getirileri, döviz kurları, kripto paralar, faiz oranları ve emtia fiyatlarından oluşan ve volatilite kümelenmesi, kalın kuyruklu dağılımlar ve zamana bağlı risk gibi özellikleri taşıyan zaman serilerinin incelenmesinde kullanılır.

Modelin ifadesi
ARCH modelinde hata teriminin varyansının, önceki dönemdeki hata terimlerinin varyansının bir fonksiyonu olduğu vasayılır. Daha matematiksel bir ifadeyle yazılırsa,

 
 
 
 q
 
 
 {\displaystyle q}
 
 geçmişte kaç dönemin dikkate alındığını gösteren bir endeks,

 
 
 
 
 σ
 
 t
 
 
 2
 
 
 
 
 {\displaystyle \sigma _{t}^{2}}
 
, 
 
 
 
 t
 
 
 {\displaystyle t}
 
 zamanındaki koşullu varyans,

 
 
 
 
 ϵ
 
 t
 
 
 =
 
 σ
 
 t
 
 
 
 z
 
 t
 
 
 
 
 {\displaystyle \epsilon _{t}=\sigma _{t}z_{t}}
 
, 
 
 
 
 
 z
 
 t
 
 
 ∼
 i
 i
 d
 
 N
 (
 0
 ,
 1
 )
 
 
 {\displaystyle z_{t}\sim iid~N(0,1)}
 

 
 
 
 
 α
 
 0
 
 
 >
 0
 
 
 {\displaystyle \alpha _{0}>0}
 
 ve her 
 
 
 
 i
 =
 1
 ,
 ⋯
 ,
 q
 
 
 {\displaystyle i=1,\cdots ,q}
 
 için 
 
 
 
 
 α
 
 i
 
 
 ≥
 0
 
 
 {\displaystyle \alpha _{i}\geq 0}
 

olmak üzere

 
 
 
 
 σ
 
 t
 
 
 2
 
 
 =
 
 α
 
 0
 
 
 +
 
 α
 
 1
 
 
 
 ϵ
 
 t
 −
 1
 
 
 2
 
 
 +
 ⋯
 +
 
 α
 
 q
 
 
 
 ϵ
 
 t
 −
 q
 
 
 2
 
 
 
 
 {\displaystyle \sigma _{t}^{2}=\alpha _{0}+\alpha _{1}\epsilon _{t-1}^{2}+\cdots +\alpha _{q}\epsilon _{t-q}^{2}}
 

modeline ARCH(q) modeli denilir.
Eğer hata teriminin ayrıca otoregresif hareketli ortalama yapısı sergilediği öne sürülüyorsa o zaman genelleştirilmiş otoregresif koşullu değişen varyans modeli (GARCH) kullanılır:

 
 
 
 
 σ
 
 t
 
 
 2
 
 
 =
 
 α
 
 0
 
 
 +
 
 α
 
 1
 
 
 
 ϵ
 
 t
 −
 1
 
 
 2
 
 
 +
 ⋯
 +
 
 α
 
 p
 
 
 
 ϵ
 
 t
 −
 p
 
 
 2
 
 
 +
 
 β
 
 1
 
 
 
 σ
 
 t
 −
 1
 
 
 2
 
 
 +
 ⋯
 +
 
 β
 
 q
 
 
 
 σ
 
 t
 −
 q
 
 
 2
 
 
 
 
 {\displaystyle \sigma _{t}^{2}=\alpha _{0}+\alpha _{1}\epsilon _{t-1}^{2}+\cdots +\alpha _{p}\epsilon _{t-p}^{2}+\beta _{1}\sigma _{t-1}^{2}+\cdots +\beta _{q}\sigma _{t-q}^{2}}

Dış bağlantılar
İMKB Endeksinin ARCH ile modellenmesi

== Kaynakça ==
