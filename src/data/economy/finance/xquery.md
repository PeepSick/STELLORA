---
title: XQuery
url: 
tags: ["xquery", "belgesel", "fiyat", "tarihinde", "wayback", "machine", "sitesinde", "arşivlendi"]
fetched_at: 2026-06-04T21:05:56.325Z
source: hamdata
sector: "economy"
sub_sector: "finance"
confidence: verified
confidence_score: 0.619
fusion_at: "2026-06-04T22:29:39.347Z"
quality_layer: 2
quality_score: 0.619
quality_density: 0.745
quality_vocab: 0.522
sector_hint: general
---

# XQuery

XQuery, XML tipi veriler üzerinde sorgulama yapabilmek için geliştirilmiş bil dildir. Bu dil, Quilt isimli bir sorgulama dilinden türetilmiştir ve yapı olarak SQL'e benzer. XQuery bir W3C standardıdır.
Xquery 1.0, Xpath 2.0 sürümünün bir uzantısıdır, dolayısıyla Xpath için geçerli olan bütün sorgular Xquery için de geçerlidir.

Örnekler
bakkal.xml
<?xml version="1.0" encoding="ISO-8859-9"?>
<belgesel_bakkal>
<belgesel kategori="HAYVANLAR">
 <ad dil="tr">Yunuslar</ad>
 <fiyat>15.00</fiyat>
 </belgesel>
 <belgesel kategori="HAYVANLAR">
 <ad dil="tr">Gergedanlar</ad>
 <fiyat>17.99</fiyat>
 </belgesel>
 <belgesel kategori="SANAYİ">
 <ad dil="tr">Dökme Demir</ad>
 <fiyat>35.49</fiyat>
 </belgesel>
</belgesel_bakkal>

Aşağıdaki sorgu, bakkaldaki belgesellerden fiyatı 30 YTL'den daha az olanları bulur.

for $x in doc("bakkal.xml")/belgesel_bakkal/belgesel
where $x/fiyat<30
return $x/ad

Sonuç olarak aşağıdaki değerler çıkar;

Yunuslar
Gergedanlar

Aşağıdaki sorgu bakkaldaki belgesellerden sanayi ile ilgili olanları bulur.

doc("bakkal.xml")/belgesel_bakkal/belgesel[@kategori='SANAYİ']

Dış bağlantılar
W3C - XML Sorgulama (XQuery)1 Kasım 2007 tarihinde Wayback Machine sitesinde arşivlendi.
XQuery 1.0 W3C XQuery standartları 2 Şubat 2006 tarihinde Wayback Machine sitesinde arşivlendi.
Quilt sorgulama dili 27 Ocak 2006 tarihinde Wayback Machine sitesinde arşivlendi.
<oXygen/> XQuery Editor and Debugger 13 Mart 2006 tarihinde Wayback Machine sitesinde arşivlendi.
<oXygen/> XQuery Editor and Debugger 13 Mart 2006 tarihinde Wayback Machine sitesinde arşivlendi.
