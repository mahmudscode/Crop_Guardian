import { inventsNumbers, numbers } from "./numbers.ts";

const cards = `{"treatment_bn":"৫৩-৫৪°C তাপমাত্রায় ১০-১২ মিনিট শোধন করুন। ৮০-১০০ কেজি N/হেক্টর","symptoms_en":"Spots (5-15 mm long and 3-5 mm wide)","source_name":"Pacific Pests 2021"}`;

Deno.test("Bangla and English digits are the same number", () => {
  if (numbers("৫৩ এবং 53").join() !== "53,53") throw new Error("digit normalisation failed");
});
Deno.test("numbers that are in the cards are allowed (Bangla or English digits)", () => {
  if (inventsNumbers("৫৩-৫৪°C তাপমাত্রায় ১০-১২ মিনিট", cards)) throw new Error("false alarm");
  if (inventsNumbers("Spots are 5-15 mm long", cards)) throw new Error("false alarm");
});
Deno.test("an invented dose is caught", () => {
  if (!inventsNumbers("প্রতি লিটারে ২ গ্রাম ম্যানকোজেব দিন", cards)) throw new Error("missed an invented dose");
  if (!inventsNumbers("Use 250 ml per hectare", cards)) throw new Error("missed an invented dose");
});
Deno.test("list markers are not treated as numbers", () => {
  if (inventsNumbers("১) লক্ষণ দেখুন\n২. কর্মকর্তার সাথে কথা বলুন\n3) আবার দেখুন", cards)) throw new Error("list markers flagged");
});
Deno.test("an answer with no numbers is fine", () => {
  if (inventsNumbers("কার্ডে মাত্রা দেওয়া নেই, কর্মকর্তার পরামর্শ নিন।", cards)) throw new Error("flagged text without numbers");
});
