# Business Case

## 1. Executive Summary

Lucina is a full‑stack e‑commerce platform for Korean skincare, designed specifically for the Italian market. It delivers a fully localised shopping experience, featuring an AI‑powered K‑Beauty assistant in Italian, server‑side coupon management, Redis‑backed cart persistence, Stripe payments, and full GDPR compliance. The platform is built on a modern, scalable stack (Angular 20, .NET 9, SQL Server, Redis).

The Italian beauty market is worth **$12.8 billion** (2025, [Statista](https://www.statista.com/outlook/cmo/beauty-personal-care/italy)) and online sales are growing at a **6.5% CAGR** through 2030, faster than any other distribution channel. K-Beauty specifically is undergoing a global resurgence: European online sales have more than tripled their share, going from 3% to 11% of global K-Beauty e-commerce between 2022 and 2025 ([Euromonitor, December 2025](https://www.euromonitor.com/newsroom/press-releases/december-2025/k-beauty-2.0-surges-online-beauty-sales-expected-to-surpass-2024-total-sales)). No dominant, localised K-Beauty platform currently serves the Italian market. Lucina is built to fill that gap.

---

## 2. Problem Statement

Italian consumers interested in Korean skincare face a fragmented, poorly localised market:

- **Generalist marketplaces** (Amazon, YesStyle) offer wide catalogues but no curated experience, no Italian-language guidance and no community context around K-Beauty routines.
- **Ingredient trust** is a growing concern: 42% of cosmetics sold in Italy already carry a natural or sustainable label ([Cosmetica Italia / IMARC Group, 2021](https://www.imarcgroup.com/italy-beauty-personal-care-market)), yet K-Beauty products are rarely presented with the contextual education that drives purchase confidence.
- **Mobile-first discovery** è il comportamento standard per i consumatori di età compresa tra 18 e 35 anni, il pubblico principale per la K‑Beauty. Tuttavia, le soluzioni attuali offrono ancora un'esperienza utente generica, orientata al desktop, che non corrisponde a come questo gruppo demografico effettivamente fa acquisti.

The result is high discovery intent that converts poorly into purchases, and low repeat-purchase rates due to absence of brand loyalty mechanisms.

---

## 3. Market Opportunity

### 3.1 Italian Beauty & Personal Care Market

| Metric | Value | Source |
|---|---|---|
| Total market size (2025) | $12.8 billion | [Statista](https://www.statista.com/outlook/cmo/beauty-personal-care/italy) |
| Online sales share (2025) | 34.4% of total revenue | [Statista](https://www.statista.com/outlook/cmo/beauty-personal-care/italy) |
| Online channel CAGR (2025–2030) | 6.5% | [Mordor Intelligence](https://www.mordorintelligence.com/industry-reports/italy-beauty-and-personal-care-market) |
| Online luxury cosmetics sales projection | €1.8 billion | [Ken Research](https://www.kenresearch.com/italy-luxury-cosmetics-and-skincare-market) |
| Internet penetration | 92% | [Ken Research](https://www.kenresearch.com/italy-luxury-cosmetics-and-skincare-market) |

Italian consumers are increasingly oriented toward premiumisation, choosing fewer but higher‑quality products and they are steadily shifting their purchases online. This creates a structurally favourable environment for a focused digital brand that can earn and sustain high levels of trust.

### 3.2 Global K-Beauty Market

| Metric | Value | Source |
|---|---|---|
| Global K-Beauty market size (2024) | $11.56 billion | [Research and Markets](https://www.researchandmarkets.com/reports/5948683/k-beauty-products-market-report) |
| Global K-Beauty market size (2025) | $12.5 billion | [Research and Markets](https://www.researchandmarkets.com/reports/5948683/k-beauty-products-market-report) |
| Global K-Beauty CAGR (2024–2029) | 6.6% | [Research and Markets](https://www.researchandmarkets.com/reports/5948683/k-beauty-products-market-report) |
| Europe share of global K-Beauty online sales (2022) | 3% | [Euromonitor](https://www.euromonitor.com/newsroom/press-releases/december-2025/k-beauty-2.0-surges-online-beauty-sales-expected-to-surpass-2024-total-sales) |
| Europe share of global K-Beauty online sales (2025) | 11% | [Euromonitor](https://www.euromonitor.com/newsroom/press-releases/december-2025/k-beauty-2.0-surges-online-beauty-sales-expected-to-surpass-2024-total-sales) |
| Skincare share of K-Beauty market | 62% | [Data Bridge Market Research](https://www.databridgemarketresearch.com/reports/global-k-beauty-products-market) |

Europe is the fastest-growing region for K-Beauty outside Asia-Pacific. Italy, alongside the UK and Germany, is one of the primary beneficiaries of this shift.

### 3.3 Target Segments

| Segment | Profile |
|---|---|
| **Primary** | Women aged 18–35, digital-native, trend-aware, active on social media |
| **Secondary** | Women aged 35–50, anti-ageing focus, quality-over-price orientation |
| **Emerging** | K-Beauty newcomers seeking guided routines and ingredient education |
| **Values-driven** | Eco-conscious consumers seeking vegan and cruelty-free certifications |

---

## 4. Solution

Lucina addresses the identified gaps with a purpose-built platform for the Italian K-Beauty market:

| Gap | Lucina's Response |
|---|---|
| No localised experience | Full Italian-language UI, AI assistant in Italian (Google Gemini) |
| No educational context | Skincare routine guide, K-Beauty educational section, FAQ |
| Poor mobile UX | Mobile-first responsive design |
| No loyalty mechanics | Newsletter with welcome coupon, server-side promotional coupons, order history |
| Trust and security concerns | User authentication and data handling follow GDPR principles, supported by secure-by-design practices such as HTTPS, HttpOnly cookies for session tokens and industry-standard security |
| Inventory reliability | Redis-backed soft reservation system to prevent overselling |

---

## 5. Competitive Landscape

| Platform | Strengths | Weaknesses vs. Lucina |
|---|---|---|
| **YesStyle** | Large catalogue, global brand recognition | No Italian localisation, generic UX|
| **Amazon.it** | Trust, logistics, Prime | No K-Beauty curation, no educational content, race-to-bottom pricing |
| **Niche Italian importers** | Local presence | Typically small, no tech investment, no mobile-first experience |

Lucina positions itself in the open space between mass marketplaces and specialist boutiques. It offers a curated, trustworthy, fully localised and technically modern experience that neither category currently provides.

---

## 6. Revenue Model

| Stream | Description |
|---|---|
| **Direct product sales** | Primary revenue from K-Beauty product catalogue |
| **Promotional partnerships** | Brand-sponsored coupon campaigns and featured placements |
| **Newsletter / CRM** | Retention-driven repeat purchases via welcome and seasonal offers |
| **Future: subscription box** | Curated monthly K-Beauty box (post-MVP expansion) |

---

## 7. Current Status

Lucina is a **fully functional MVP**, not a concept. The following capabilities are already implemented and production-ready:

- Full shopping experience: product browsing, search, filtering, cart management and order confirmation
- Secure user accounts with login, registration, profile and full order history
- Promotional coupon system with admin-controlled generation and automatic discount application at checkout
- AI K-Beauty assistant in Italian, capable of guiding users through routines and product choices
- Newsletter subscription with automated welcome offer delivery
- Contact form with server-side email delivery
- Privacy Policy, Terms of Service and consent management at registration
- Admin back-office for coupon and order management

The platform is deployable today. Investment would accelerate go-to-market, not fund development of core functionality.

---

## 8. What Investment Would Unlock

| Area | Use of Funds |
|---|---|
| **Inventory** | Sourcing real K-Beauty products from Korean suppliers or distributors |
| **Logistics** | 3PL partnership for warehousing and Italian/EU shipping |
| **Payments** | Stripe integration for real transaction processing (VAT registration required) |
| **Marketing** | Influencer campaigns, SEO content, social media presence |
| **Infrastructure** | Cloud hosting (Azure / AWS), CDN, monitoring, backups |
| **Legal & Compliance** | Product labelling compliance (EU cosmetics regulation), customs |

---

## 9. Risk Summary

| Risk | Mitigation |
|---|---|
| Competitor with larger marketing budget | Focus on localisation and community depth that generalists cannot replicate quickly |
| Platform downtime | Cloud infrastructure with redundancy and disaster recovery |
| Regulatory non-compliance | EU cosmetics labelling addressed at product sourcing stage |
| Slow initial traction | Newsletter and coupon mechanics built in; low CAC via organic/influencer strategy |

---

## 10. Conclusion

The Italian K‑Beauty market is expanding and remains underpenetrated by fully localised players, making it naturally aligned with Lucina’s positioning. The platform is already production‑ready and fully functional. The real opportunity now lies in execution: sourcing, logistics and market awareness. Lucina is not asking an investor to finance a build. It is looking for a partner who can help scale something that already works.