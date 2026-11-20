---
title: "Passage review sheet"
type: operation
created: 2026-11-20
updated: 2026-11-20
sources:
  - code: supabase/seed_passages.sql
verified_at: 12c50cb
---

# Passage review sheet

The follow-up chat can only use a disease passage once a person has checked it against its source ([[chat-assistant]], [[knowledge-base]]). This sheet lists all 52 passages loaded on 2026-11-20, all **unverified**, each with the source section to check. It is a snapshot of `supabase/seed_passages.sql`; if you change a passage, change the seed and this sheet together.

## How to review (about 5 minutes per disease)
1. Open the source (link under each disease). For each row, find the section named in "Where to check" and compare **every fact and number** in the passage with the source. The passage must say nothing the source does not say, and must not add a dose.
2. Fix or delete any row that is wrong. To change a passage, update its `passage_en`, set `embedding = null`, then call the `embed-cards` function until it returns zeros.
3. When every row for a disease is right, mark that disease reviewed in the database (replace the name):
   `update disease_passages set verified = true, verified_by = 'Your name' where disease_name_en = 'Blast';`
4. Tick the boxes below and commit this file.

> ⚠️ Passages for Blast, Brown spot and Bacterial leaf blight were written from a **summary** of the Pacific Pests page (the tool used to read it returned a summary, not the page text), so check those rows most carefully, especially numbers (temperatures, percentages, humidity, hours).

> ⚠️ Passages for Sheath blight and Tungro were written from the IRRI chapters read in full from the published PDFs, but still need the same check.


## Sheath blight

Source: IRRI, Rice Diseases: Biology & Selected Management Practices (2018), Section 1 Ch. 3 (leaf sheath and culm diseases), sheath blight. Link: https://rice-diseases.irri.org/contents

| Reviewed | Topic | Passage | Where to check |
|---|---|---|---|
| [ ] | hosts | The sheath blight fungus (Rhizoctonia solani AG1-IA) attacks rice and also other crops such as maize, sorghum, soybean, mungbean and cowpea, and many weeds growing around rice fields, such as Echinochloa spp. and Monochoria sp. | sec. 2.2.3 Host range |
| [ ] | survival spread | The fungus survives between crops as sclerotia (resting bodies) and as mycelium in rice stubble and plant debris left in the field. It also survives on other hosts: weeds, ratoon rice, and upland crops such as maize and legumes grown after rice. | sec. 2.2.4.2 Sources of inoculum |
| [ ] | survival spread | After a field is flooded, sclerotia float in the paddy water and attach to the base of a plant near the waterline, where they usually cause the first lesions. The fungus then grows upward and sideways, from tiller to tiller and between neighbouring plants, and a new lesion starts where its mycelium touches healthy tissue. The disease attacks all parts of the rice plant except the roots. | sec. 2.2.4.1 and 2.2.5 Infection and spread |
| [ ] | survival spread | Under field conditions the fungus can spread very fast, estimated at 20 cm/day on average. Signs of the disease are sclerotia, mycelial strands growing over the lesions, and thin grayish or white powdery layers (hymenia) on leaf sheaths or leaf blades of young plants. | sec. 2.2.1 Symptoms |
| [ ] | favouring conditions | Sheath blight gets worse with more nitrogen fertilizer, because nitrogen changes the crop canopy so that leaves touch more and stay wet for longer; leaf wetness matters more than humidity itself. In one study, yield reduction reached 20 to 42% in plots with the highest amount of nitrogen. | sec. 2.2.5 and 2.2.7.1 Nitrogen |
| [ ] | favouring conditions | Sheath blight became a major disease after rice growing was intensified with high-yielding semidwarf varieties, high nitrogen and continuous cropping. A given level of disease causes more yield loss where the attainable yield is high. It is also favoured by the shift from transplanted to direct-seeded rice. | sec. 2.1 and 2.2.4 Intensive rice growing |
| [ ] | impact | In tropical and subtropical Asia, sheath blight causes an average yield loss of about 6%, which is higher than that caused by other rice diseases. In China it causes an annual yield loss of 3 to 4%, equal to 6 million tons. A yield loss of 50% has been reported in plots of highly susceptible varieties in the United States. | sec. 2.2.1 and 2.2.7 Losses |
| [ ] | management cultural | To manage sheath blight, avoid excessive nitrogen: apply only the amount the crop needs and the soil does not already supply. Splitting the nitrogen into several applications, instead of applying all of it early in the season, has been recommended. | sec. 2.2.7.1 Nitrogen |
| [ ] | management cultural | Field sanitation is one of the most effective ways to reduce sheath blight: remove or destroy infected rice straw and weeds inside the field and on the levees. Burning does not completely destroy sclerotia, so it must be combined with other measures. Ploughing the stubble soon after harvest and speeding up straw decomposition reduce the fungus; Trichoderma harzianum has been used for rapid composting. | sec. 2.2.7.5 Field sanitation |
| [ ] | management cultural | Silicon can reduce sheath blight. Sources include calcium silicate slag or cheaper rice hulls or rice straw, and varieties with high silicon content. Plants given silicon had less sheath blight than plants without it. | sec. 2.2.7.2 Application of silicon |
| [ ] | management biological | Antagonistic bacteria such as Bacillus subtilis and strains of Pseudomonas fluorescens have been used against sheath blight, most widely in China. Used alone the results were often inconsistent; results were more consistent when Bacillus subtilis was mixed with a half dose of a commercial fungicide (Jingangmycin in China, Validamycin in Vietnam). Many biological control agents have not been tested in the field or are not yet commercially available. | sec. 2.2.7.3 Biological control |
| [ ] | management resistance | No commercial rice variety is known to be resistant to sheath blight. The best available are varieties that are less susceptible. Managing sheath blight with resistant varieties has not been promoted the way it has for blast. | sec. 2.2.7 Disease management |
| [ ] | management chemical | Fungicides are commonly used against sheath blight in Japan, Korea, China and Vietnam, but not widely in other Asian countries because they are not available in local markets and are not economically feasible for resource-poor farmers. Reported effective fungicides are azoxystrobin, flutolanil, pencycuron, hexaconazole and propiconazole; validamycin, an antibiotic, is widely used. They worked best when applied at the booting and heading stages; application after heading was less effective. | sec. 2.2.7.4 Chemical control |

## Tungro

Source: IRRI, Rice Diseases: Biology & Selected Management Practices (2018), Section 3 Ch. 1 (leafhopper-borne virus diseases), rice tungro. Link: https://rice-diseases.irri.org/contents

| Reviewed | Topic | Passage | Where to check |
|---|---|---|---|
| [ ] | survival spread | Tungro is not spread by touch, by seed, or through the soil. It is carried from plant to plant by leafhoppers. The main carrier is the green leafhopper; other leafhoppers (Nephotettix nigropictus, N. cincticeps, N. malayanus, N. parvus and the zig-zag leafhopper Recilia dorsalis) can also carry it. | sec. 5.5 Transmission by vectors |
| [ ] | survival spread | A green leafhopper can pick up the tungro viruses after feeding only 10 to 30 minutes on an infected plant and can pass them on soon afterwards. It usually keeps the ability for 2 or 3 days (up to 5 or 6 days), longer at lower temperatures. It loses the ability after molting but can pick the viruses up again. | sec. 5.5 Transmission by vectors |
| [ ] | survival spread | The green leafhopper feeds almost only on rice and can have 9 to 12 generations a year if rice is available. When there is no rice it feeds on several wild rice species and grassy weeds. | sec. 5.7.1 Vector biology and ecology |
| [ ] | favouring conditions | Tungro is generally endemic and often reaches epidemic levels in irrigated areas where rice planting is staggered and rice is present throughout the year. Where planting is roughly synchronized in one or two seasons a year with fallow periods in between, tungro is scarce or absent in many years, although it may reach epidemic levels about once in a decade. In rainfed and upland rice it is absent, except in years of widespread outbreaks. | sec. 5.7 Disease cycle and epidemiology |
| [ ] | favouring conditions | Tungro is generally higher in the rainy season than in the dry season, higher in fields planted when leafhopper numbers are high, and higher in fields planted late in the crop season. Applying nitrogen fertilizer was reported to increase tungro, and extra nitrogen did not help reduce it. | sec. 5.10.2 Cultivation practices |
| [ ] | impact | Major tungro outbreaks have repeatedly caused serious damage in Bangladesh, India, Indonesia, Malaysia, the Philippines, Thailand and Vietnam. In the 1980s, average annual losses from tungro were estimated to exceed USD 1,500 million. | sec. 5.8 Losses |
| [ ] | management cultural | Seedlings 3 or 4 weeks old are suitable for tungro management; planting old seedlings increased infection in seedbeds and in the transplanted fields. Seedlings rarely showed tungro symptoms in nursery beds at 25 days after sowing but more often at 45 days. | sec. 5.10.2 Cultivation practices |
| [ ] | management cultural | Field sanitation is an important measure against tungro. Ploughing, and mowing weeds or applying herbicide in and around the fields during the fallow period, reduce leafhoppers and sources of the disease. Dry ploughing during the fallow period reduced leafhopper numbers and infected rice stubble and grass. | sec. 5.10.2 Cultivation practices |
| [ ] | management cultural | Planting fields in an area at about the same time, with a fallow period of 1 month or more between crops, has been used successfully against tungro in Indonesia and Malaysia. The scheme in South Sulawesi also planted when leafhopper numbers were low, rotated varieties with different resistance, and treated affected fields to stop the spread to nearby fields. Tungro was generally low in areas that followed the scheme. | sec. 5.10.3 Synchrony in planting |
| [ ] | management resistance | Resistant varieties are the most efficient and economical control measure for tungro and have played a critical role in managing it, especially in irrigated areas of South and Southeast Asia. Many varieties have been identified as resistant or tolerant. | sec. 5.9.1 Cultivar resistance |
| [ ] | management chemical | No chemical works against the tungro viruses themselves, so insecticides are used to reduce the leafhoppers that carry them; they are applied against tungro spread, not because leafhoppers damage the plants by feeding. In a trial, applying a knockdown compound together with an insectistatic compound at 2 and 16 days after transplanting gave efficient control, while applying in the nursery beds had little effect. | sec. 5.10.1 Chemical control |
| [ ] | management chemical | Insecticide sprays on the leaves were often ineffective because monsoon rain washed them off, so they worked less well in the wet season, when tungro is generally higher. Spraying early in the crop, if done improperly, can cause brown planthopper numbers to build up. In the Philippines one insecticide became less effective against tungro because the leafhoppers developed resistance to it. | sec. 5.10.1 Chemical control |

## Blast

Source: Pacific Pests, Pathogens and Weeds (online edition v10), Rice blast, Grahame Jackson, 2021. Link: https://apps.lucidcentral.org/pppw_v10/text/web_full/entities/rice_blast_252.htm

| Reviewed | Topic | Passage | Where to check |
|---|---|---|---|
| [ ] | identification | Blast spots on leaves are oval or diamond-shaped, 5-15 mm long and 3-5 mm wide, with dark borders and often a yellow halo. As spots age the centre turns whitish-grey and the border becomes wider and red-brown. Spots join together, leaves die, and a field can look scorched. | Symptoms & Life Cycle |
| [ ] | identification | The spores also infect the leaf sheath, stem and panicle and cause: collar rot (kills the leaf); neck rot (rotten neck, whiteheads); panicle rot (brown or black branches); and node rot (black-brown and dry; the plant dies if the stem breaks). | Symptoms & Life Cycle |
| [ ] | favouring conditions | Frequent, prolonged showers and temperatures of 24-28 C favour blast. Leaves must stay wet for 6-8 hours for spores to germinate and the humidity must be close to 100%. In upland areas dew from day and night temperature differences also favours it. In lowland fields leaf infection is lower, but blast is serious in seedling nurseries and on panicles. | Symptoms & Life Cycle |
| [ ] | survival spread | Blast spreads in irrigation water, and spores are carried short and long distances by air currents and wind. Between crops the fungus survives in straw and stubble, in seed, in volunteer rice, and on alternative grass hosts. | Symptoms & Life Cycle |
| [ ] | impact | Blast is a major disease of rice. It can kill plants up to tillering or reduce grain yield and quality. Rice grown all year round gives the potential for major epidemics, and the impact is less where rice is rotated with root crops or intercropped with sorghum, maize, cassava or vegetables. | Impact |
| [ ] | management cultural | Blast management uses an integrated (IPM) approach: tolerant or resistant varieties, splitting nitrogen into two or three applications, acceptable plant spacing, transplanting seedlings rather than broadcasting, avoiding water stress or long drained periods (flood as often as possible), and getting rid of crop residues. Change the planting date so that flowering does not fall in high humidity, and plant at the same time as your neighbours. | Management: cultural control |
| [ ] | management cultural | After harvest, collect and burn or bury the remains and stubble as soon as possible, and do not plant while the last crop is still in the ground. | Management: cultural control, after harvest |
| [ ] | management resistance | Resistant varieties have been bred against blast, but they may succumb to new strains of the fungus. | Management: resistant varieties |
| [ ] | management chemical | Smallholders rarely use fungicides against blast because of the expense and availability. For upland rice, seed treatment 1-2 days before sowing uses protectants (captan or mancozeb) or systemic products (pyroquilon, azoles, strobilurins). Check what is registered and available locally and follow the product label for dosage, timing and pre-harvest interval. | Management: chemical |

## Brown spot

Source: Pacific Pests, Pathogens and Weeds (online edition v10), Rice brown leaf spot, Grahame Jackson, 2021. Link: https://apps.lucidcentral.org/pppw_v10/text/web_full/entities/rice_brown_leaf_spot_427.htm

| Reviewed | Topic | Passage | Where to check |
|---|---|---|---|
| [ ] | favouring conditions | Brown spot affects seedlings, leaves, leaf sheaths and panicles (glumes and seeds). It is worse in dryland than in wetland, especially under continuous cropping and low soil fertility. Low nitrogen, phosphorus and potassium, and perhaps low silica and manganese, are linked to the disease. | Symptoms & Life Cycle |
| [ ] | favouring conditions | Humidity above 85% for a few days, light rain, heavy dew and temperatures of 20-30 C favour brown spot. | Symptoms & Life Cycle |
| [ ] | identification | On seedlings brown spot makes small, circular, yellow-brown or brown spots that girdle and distort the leaf sheaths. At tillering the spots are circular to oval, up to 10 mm long, dark brown to purple; mature spots have light brown to grey centres with dark brown margins. | Symptoms & Life Cycle |
| [ ] | identification | On seeds, brown spot causes brown 'eye-spot' marks with light centres, and infected seeds do not fill properly; black spore masses form on leaf and seed spots. The spots look like blast but appear later, are more regular in outline and have lighter centres. | Symptoms & Life Cycle, and Detection |
| [ ] | survival spread | Spores spread short distances by wind and longer distances on infected seed. The fungus survives in infected seed, volunteer rice, rice debris and wild grasses. | Symptoms & Life Cycle |
| [ ] | impact | Brown spot is not considered as serious as blast. IRRI calculates a yield loss of 5% a year across South and Southeast Asia, with local losses of over 40%. Losses come from seedling death and from lower seed quality and weight. | Impact |
| [ ] | management cultural | Treat seed with hot water, 53-54 C for 10-12 minutes, before planting. Apply fertilizer at the recommended rates. After harvest, collect the straw and debris and burn it with the stubble, or plough it into the soil. Use resistant varieties and check with local extension staff which suit your area. | Management: cultural control |
| [ ] | management chemical | Consider fungicides only after checking for a nutrient deficiency and whether resistant varieties are available. IRRI recommends seed treatments with iprodione, strobilurins (azoxystrobin or trifloxystrobin), an azole (propiconazole) or carbendazim. Sprays on the leaves at tillering and late boot stage are effective only if combined with a seed treatment. | Management: chemical |

## Bacterial leaf blight

Source: Pacific Pests, Pathogens and Weeds (online edition v10), Rice bacterial leaf blight, Grahame Jackson, 2021. Link: https://apps.lucidcentral.org/pppw_v10/text/web_full/entities/rice_bacterial_leaf_blight_418.htm

| Reviewed | Topic | Passage | Where to check |
|---|---|---|---|
| [ ] | identification | The bacteria enter the plant through natural openings and wounds, move in the water-conducting vessels (xylem) and block them. In older plants, pale yellow streaks with wavy margins run from the leaf tips toward the base and the leaves dry and die. Infection as late as booting does not affect yield but reduces grain quality. Streaks may also appear on sheaths and stems of susceptible varieties. | Symptoms & Life Cycle |
| [ ] | identification | Wavy margins on the streaks distinguish bacterial leaf blight from bacterial leaf streak, which has straight margins. In a cut-leaf test, cloudy liquid streams from the cut end of a leaf held in water. The disease can be mistaken for stem borer damage. | Detection and inspection |
| [ ] | favouring conditions | Warm, humid weather favours bacterial leaf blight: temperatures of 25-34 C and relative humidity above 70%. Too much nitrogen increases humidity inside the crop and increases the disease. | Symptoms & Life Cycle, and Cultural control |
| [ ] | survival spread | Within a crop the bacteria spread in irrigation and flood water and by wind-driven rain; over longer distances they probably travel on seed. How the bacteria survive between crops is not well understood, but probably in seed. They survive about a month in dryland soil or plant remains, perhaps half as long when submerged, and longer on weeds. | Spread and survival |
| [ ] | hosts | Besides rice, the bacterium lives on wild grasses, especially rice cutgrass (Leersia species). | Hosts |
| [ ] | impact | Bacterial leaf blight can be devastating if infection is early. Yield losses of 20% to more than 70% have been reported in Southeast Asia and India. In the Philippines, losses were more than 20% on susceptible varieties in the wet season and 7% in the dry season. | Impact |
| [ ] | management cultural | Choose seed from uninfected plants. When lifting seedlings keep the roots intact and do not clip the leaves. Keep weeds, especially Leersia, under control. Make sure fields can drain, because most varieties cannot withstand flooding for more than a week. After harvest, plough to bury stubble, straw, ratoon and volunteer plants, and let fallow fields dry. | Management: cultural control |
| [ ] | management cultural | Too much nitrogen increases humidity and disease; a suggested amount is 80-100 kg N/ha, depending on local conditions. | Management: cultural control |
| [ ] | management resistance | In low-input systems, resistant or tolerant varieties plus good weed control are the main approach. Check which resistant varieties are available locally. | Management: cultural control, resistant varieties |
| [ ] | management chemical | Copper compounds and antibiotics are costly and have not been shown to be effective against bacterial leaf blight. | Management: chemical |
