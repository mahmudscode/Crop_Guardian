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

-- 4-5. Sheath blight and Tungro: from IRRI, "Rice Diseases: Biology & Selected Management Practices" (c) 2018, eds. Opulencia & Hettel
--      https://rice-diseases.irri.org/contents ; PDFs kept locally in docs/raw/ (not committed).
insert into disease_cards
  (crop, disease_name_en, disease_name_bn, symptoms_en, symptoms_bn, cause,
   treatment_bn, prevention_bn, severity_note, source_name, source_url, source_page, verified)
values
('rice', 'Sheath blight', 'খোলপচা',
 'Spots first appear on the leaf sheaths near the waterline: ellipsoid or ovoid, greenish-grey, with the centre soon becoming grayish-white with a brown margin. Spots coalesce into large patches. Lesions expand rapidly on the sheath, causing the corresponding leaf blade to wilt and die within a few days. Sclerotia form at the margin of older lesions.',
 'পানির লাইনের কাছে পাতার খোলে প্রথমে ডিম্বাকার বা লম্বাটে, সবুজাভ-ধূসর দাগ দেখা যায়; দাগের মাঝখান শীঘ্রই ধূসর-সাদা ও কিনারা বাদামী হয়। দাগগুলো মিলে বড় ছোপ তৈরি করে। খোলে দাগ দ্রুত বাড়ে এবং সংশ্লিষ্ট পাতা কয়েক দিনের মধ্যে নেতিয়ে মরে যায়। পুরনো দাগের কিনারায় স্ক্লেরোশিয়া (ছত্রাকের শক্ত দানা) তৈরি হয়।',
 'Caused by the fungus Rhizoctonia solani (AG1-IA). Spread is favoured by dense canopy, excess nitrogen and prolonged leaf wetness.',
 'প্রয়োজনের বেশি নাইট্রোজেন সার দেবেন না; একবারে সব না দিয়ে কয়েক কিস্তিতে দিন। আক্রান্ত খড় ও আগাছা মাঠ ও আইল থেকে সরিয়ে ফেলুন বা নষ্ট করুন (মাঠ পরিচ্ছন্ন রাখা সবচেয়ে কার্যকর পদ্ধতিগুলোর একটি)। ফসল কাটার অল্প পরেই গোড়া চষে দিলে ছত্রাকের বৃদ্ধি কমে। উৎস অনুযায়ী কার্যকর ছত্রাকনাশক: অ্যাজক্সিস্ট্রোবিন, ফ্লুটোলানিল, পেনসাইকুরন, হেক্সাকোনাজোল ও প্রপিকোনাজোল; ভ্যালিডামাইসিন (অ্যান্টিবায়োটিক) এশিয়ার কিছু দেশে ব্যবহৃত হয়। বুট ও শীষ বের হওয়ার সময় প্রয়োগ করলে ভালো ফল, শীষ বের হওয়ার পর কম কার্যকর। মাত্রা উৎসে দেওয়া নেই; কৃষি কর্মকর্তার পরামর্শ নিন। উৎস বলছে, স্বল্প সম্পদের কৃষকের জন্য রাসায়নিক নিয়ন্ত্রণ অর্থনৈতিকভাবে সাধ্যের মধ্যে নাও হতে পারে।',
 'ঘন করে চারা রোপণ এড়ান। কোনো বাণিজ্যিক জাত এই রোগে সম্পূর্ণ প্রতিরোধী বলে জানা নেই; কিছু জাত তুলনামূলক কম আক্রান্ত হয়।',
 null,
 'IRRI, Rice Diseases: Biology & Selected Management Practices, Section 1 Ch. 3 (Leaf sheath and culm diseases), sheath blight sec. 2.2, 2018',
 'https://rice-diseases.irri.org/contents',
 'Sec. 2.2.1 Symptoms; 2.2.7 Disease management (printed pp. 33-37)', false),

('rice', 'Tungro', 'টুংরো',
 'Infected plants are stunted with yellow or yellow-orange discoloration of leaves, starting from the leaf tips. Tillering is reduced. Young leaves may show striping, mottling or interveinal chlorosis; old leaves may show rusty-coloured blotches. Panicle emergence is delayed and often incomplete; panicles are short and bear unfilled or discolored grains. Symptoms are more severe when plants are infected young.',
 'আক্রান্ত গাছ খর্বাকার হয় এবং পাতা ডগা থেকে শুরু করে হলুদ বা হলুদ-কমলা রঙ ধারণ করে। কুশির সংখ্যা কমে যায়। কচি পাতায় ডোরা, ছোপ বা শিরার মাঝখানে হলদেভাব দেখা যেতে পারে; পুরনো পাতায় মরিচার মতো দাগ হতে পারে। শীষ বের হতে দেরি হয় ও প্রায়ই অসম্পূর্ণ থাকে; শীষ ছোট হয় এবং চিটা বা বিবর্ণ দানা হয়। গাছ অল্প বয়সে আক্রান্ত হলে লক্ষণ বেশি গুরুতর হয়।',
 'Caused by two viruses (rice tungro bacilliform virus and rice tungro spherical virus), spread by the green leafhopper (Nephotettix virescens) and related leafhoppers.',
 'এই রোগের জন্য কোনো ভাইরাসনাশক ওষুধ নেই; ভাইরাসবাহী সবুজ পাতাফড়িং (জিএলএইচ) দমন করাই মূল কথা। উৎস অনুযায়ী পোকা কমাতে কীটনাশক ব্যবহার হয়, তবে সময় গুরুত্বপূর্ণ (রোপণের ২ ও ১৬ দিন পর প্রয়োগে ভালো ফল পাওয়া গেছে; বীজতলায় প্রয়োগে ফল কম)। বর্ষায় বৃষ্টিতে ওষুধ ধুয়ে যাওয়ায় কীটনাশক প্রায়ই কম কার্যকর হয়, এবং ভুলভাবে প্রয়োগে বাদামী গাছফড়িংয়ের প্রকোপ বাড়তে পারে। কীটনাশকের নাম ও মাত্রার জন্য কৃষি কর্মকর্তার পরামর্শ নিন।',
 'রোগ প্রতিরোধী জাত ব্যবহার করুন। এলাকাজুড়ে একই সময়ে রোপণ করুন এবং দুই ফসলের মাঝে প্রায় ১ মাস জমি পতিত রাখুন। পতিত সময়ে শুকনো চাষ এবং/অথবা আগাছানাশক ব্যবহার করলে পাতাফড়িং ও রোগের উৎস কমে।',
 null,
 'IRRI, Rice Diseases: Biology & Selected Management Practices, Section 3 Ch. 1 (Leafhopper-borne virus diseases), rice tungro sec. 5, 2018',
 'https://rice-diseases.irri.org/contents',
 'Sec. 5.2 Symptoms (printed p. 58); 5.10 Control (printed pp. 92-94)', false);

-- 6. Hispa: NO source text retrieved yet. Name only. Do NOT fill from memory.
insert into disease_cards (crop, disease_name_en, disease_name_bn, source_name, verified) values
  ('rice', 'Hispa', 'হিসপা পোকা', 'TODO: IRRI/BRRI/DAE/CABI hispa fact sheet', false);
