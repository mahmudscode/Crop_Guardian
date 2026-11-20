-- Disease cards. Built ONLY from the source text listed per card.
-- All cards ship with verified=false: a teammate must check each against its source
-- (and a Bangla reader must review the translation) before setting verified=true.
-- Source: Pacific Pests, Pathogens and Weeds, online edition v10, Grahame Jackson, (c) 2021
--         https://apps.lucidcentral.org/pppw_v10/text/web_full/entities/
-- No doses are given in these sources, so none appear below.

insert into disease_cards
  (crop, disease_name_en, disease_name_bn, symptoms_en, symptoms_bn, cause,
   treatment_bn, prevention_bn, severity_note, source_name, source_url, source_page, verified)
values
-- 1. Blast (rice_blast_252.htm)
('rice', 'Blast', 'ব্লাস্ট',
 'Oval or diamond-shaped spots (5-15 mm long and 3-5 mm wide) with dark borders occur on the leaves. Rots can also occur on the sheath, stem and panicle, including neck rot.',
 'পাতায় ডিম্বাকৃতি বা হীরার আকারের দাগ (৫-১৫ মিমি লম্বা, ৩-৫ মিমি চওড়া) যার কিনারা গাঢ় রঙের। খোল, কাণ্ড ও শীষেও পচন হতে পারে, শীষের গোড়ায় (নেক) পচনও হয়।',
 'Caused by a fungus (Magnaporthe oryzae). Spreads in irrigation water and air currents.',
 'রোগ ব্যবস্থাপনায় সমন্বিত পদ্ধতি (IPM) দরকার। বীজ বপনের ১-২ দিন আগে বীজ ছত্রাকনাশক দিয়ে শোধন করলে বীজবাহিত সংক্রমণ কমে। উৎস অনুযায়ী ব্যবহারযোগ্য ছত্রাকনাশক: ক্যাপটান বা ম্যানকোজেব (প্রতিরক্ষামূলক), অথবা পাইরোকুইলন, অ্যাজোল ও স্ট্রোবিলুরিন (অন্তর্বাহী)। মাত্রা উৎসে দেওয়া নেই; কৃষি কর্মকর্তার পরামর্শ নিন।',
 null,
 'Source calls blast a serious, major rice disease; fungicides are rarely used by smallholders.',
 'Pacific Pests, Pathogens and Weeds (online edition v10), Rice blast, Grahame Jackson, 2021',
 'https://apps.lucidcentral.org/pppw_v10/text/web_full/entities/rice_blast_252.htm',
 'Symptoms & Life Cycle; Management (Chemical)', false),

-- 2. Brown spot (rice_brown_leaf_spot_427.htm)
('rice', 'Brown spot', 'বাদামী দাগ',
 'Seedlings show small, circular, yellow-brown or brown spots girdling and distorting the leaf sheaths. Later leaf spots are dark brown to purple with light grey centres. Infected seeds do not fill properly.',
 'চারায় ছোট, গোলাকার, হলুদ-বাদামী বা বাদামী দাগ পাতার খোলকে ঘিরে ফেলে ও বিকৃত করে। পরে পাতায় গাঢ় বাদামী থেকে বেগুনি দাগ হয় যার মাঝখান হালকা ধূসর। আক্রান্ত বীজ ঠিকমতো ভরাট হয় না।',
 'Caused by a fungus (Cochliobolus miyabeanus; asexual name Bipolaris oryzae).',
 'বপনের আগে বীজ গরম পানিতে শোধন করুন: ৫৩-৫৪°C তাপমাত্রায় ১০-১২ মিনিট। সুপারিশকৃত মাত্রায় সার দিন। IRRI বীজ শোধনের জন্য ইপ্রোডিয়ন, স্ট্রোবিলুরিন (অ্যাজক্সিস্ট্রোবিন বা ট্রাইফ্লক্সিস্ট্রোবিন), অ্যাজোল (প্রপিকোনাজোল) ও কার্বেন্ডাজিম গোত্রের ছত্রাকনাশক সুপারিশ করে। মাত্রা উৎসে দেওয়া নেই; কৃষি কর্মকর্তার পরামর্শ নিন।',
 'রোগ প্রতিরোধী জাতের জন্য স্থানীয় কৃষি সম্প্রসারণ কর্মীর সাথে কথা বলুন।',
 null,
 'Pacific Pests, Pathogens and Weeds (online edition v10), Rice brown leaf spot, Grahame Jackson, 2021',
 'https://apps.lucidcentral.org/pppw_v10/text/web_full/entities/rice_brown_leaf_spot_427.htm',
 'Symptoms & Life Cycle; Management', false),

-- 3. Bacterial leaf blight (rice_bacterial_leaf_blight_418.htm)
('rice', 'Bacterial leaf blight', 'ব্যাকটেরিয়াজনিত পাতা ঝলসানো',
 'On seedlings, leaves show grey-green streaks starting from the tips and at the margins; later the streaks turn yellowish-white with wavy edges. Early systemic infection on transplanted rice is called kresek. Milky bacterial ooze dries to a crust on the leaves.',
 'চারায় পাতার ডগা ও কিনারা থেকে ধূসর-সবুজ দাগ শুরু হয়; পরে দাগ হলুদাভ-সাদা হয় ও কিনারা ঢেউখেলানো হয়। রোপণ করা ধানে প্রাথমিক সিস্টেমিক সংক্রমণকে "ক্রেসেক" বলে। দুধের মতো ব্যাকটেরিয়া-নিঃসরণ পাতায় শুকিয়ে ছাল হয়ে যায়।',
 'Caused by the bacterium Xanthomonas oryzae pv. oryzae.',
 'উৎস অনুযায়ী তামা-জাতীয় যৌগ ও অ্যান্টিবায়োটিক কার্যকর প্রমাণিত নয় এবং ব্যয়বহুল। রোগ প্রতিরোধী বা সহনশীল জাত ব্যবহার করুন এবং আগাছা ভালোভাবে দমন করুন। নাইট্রোজেন সার: উৎসের পরামর্শ ৮০-১০০ কেজি N/হেক্টর, স্থানীয় অবস্থা অনুযায়ী। বেশিরভাগ জাত এক সপ্তাহের বেশি জলমগ্ন থাকলে টিকতে পারে না, তাই পানি নিষ্কাশনের ব্যবস্থা রাখুন।',
 'সনদপ্রাপ্ত রোগমুক্ত বীজ ব্যবহার করুন।',
 null,
 'Pacific Pests, Pathogens and Weeds (online edition v10), Rice bacterial leaf blight, Grahame Jackson, 2021',
 'https://apps.lucidcentral.org/pppw_v10/text/web_full/entities/rice_bacterial_leaf_blight_418.htm',
 'Symptoms & Life Cycle; Management', false);

-- 4-6: NO source text retrieved yet (IRRI Knowledge Bank unreachable, Drive chapters unreadable,
-- BRRI TLS error). Names only. Do NOT fill from memory. Add source text, then fill these rows.
insert into disease_cards (crop, disease_name_en, disease_name_bn, source_name, verified) values
  ('rice', 'Sheath blight', 'খোলপচা', 'TODO: IRRI Rice Diseases ch. Part II Sec 1 Ch 3, or BRRI/DAE', false),
  ('rice', 'Tungro', 'টুংরো', 'TODO: IRRI Rice Diseases ch. Part II Sec 3 Ch 1, or BRRI/DAE', false),
  ('rice', 'Hispa', 'হিসপা পোকা', 'TODO: IRRI/BRRI/DAE/CABI hispa fact sheet', false);
