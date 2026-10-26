/* AUTO-GENERATED fallback copy of data/prices.json (used when the page is opened via file:// or the JSON can't be loaded).
   Keep it identical to data/prices.json — admin.html downloads both. */
window.OKASTO_PRICES = {
  "_readme": "OKASTO price data. Price arrays follow the 'vehicles' order. null = unavailable. Edit with admin.html, then upload this file AND js/prices-data.js.",
  "_geo_readme": "Place search: every location with 'center' is searchable by its names + 'aliases'. Zone matching for a map point: airports by radiusKm first, then 'polygons' ([lat,lon] points), then the nearest 'center' within its radiusKm. Bangkok Zone 1/2 polygons follow the Chao Phraya River (OpenStreetMap) and a Lak Si cut-off at latitude 13.895. 'places' are extra built-in landmarks (name, aliases, at=[lat,lon]); their zone is worked out from the map, not typed in.",
  "updated": "2026-10-26",
  "currency": "THB",
  "markupPercent": 0,
  "roundTo": 10,
  "extraBabySeat": 300,
  "autoReverse": true,
  "vehicles": [
    {
      "id": "economy",
      "pax": 3,
      "paxLabel": "3",
      "bags": 2
    },
    {
      "id": "suv",
      "pax": 4,
      "paxLabel": "4",
      "bags": 2
    },
    {
      "id": "premium",
      "pax": 3,
      "paxLabel": "3",
      "bags": 2
    },
    {
      "id": "ev",
      "pax": 3,
      "paxLabel": "3",
      "bags": 2
    },
    {
      "id": "van",
      "pax": 9,
      "paxLabel": "6-9",
      "bags": 2
    },
    {
      "id": "luxvan",
      "pax": 5,
      "paxLabel": "5",
      "bags": 2
    }
  ],
  "locations": [
    {
      "id": "BKK",
      "type": "airport",
      "name": {
        "en": "Suvarnabhumi Airport (BKK)",
        "th": "สนามบินสุวรรณภูมิ (BKK)",
        "zh": "素万那普机场 (BKK)"
      },
      "aliases": ["Suvarnabhumi", "Suvarnabhumi Airport", "Swampy", "Suvanabhumi", "Suvarnaphumi", "Suwannaphum", "Survarnabhumi", "BKK", "Bangkok Airport", "Bangkok International Airport", "สุวรรณภูมิ", "สนามบินสุวรรณภูมิ", "ท่าอากาศยานสุวรรณภูมิ", "素万那普", "素万那普机场", "素旺那普", "曼谷机场", "曼谷素万那普机场", "新曼谷机场"],
      "center": [13.69, 100.7501],
      "radiusKm": 4
    },
    {
      "id": "DMK",
      "type": "airport",
      "name": {
        "en": "Don Mueang Airport (DMK)",
        "th": "สนามบินดอนเมือง (DMK)",
        "zh": "廊曼机场 (DMK)"
      },
      "aliases": ["Don Mueang", "Don Muang", "Donmuang", "Don Meuang", "Don Mueng", "DMK", "Don Mueang Airport", "Old Bangkok Airport", "ดอนเมือง", "สนามบินดอนเมือง", "ท่าอากาศยานดอนเมือง", "廊曼", "廊曼机场", "曼谷廊曼机场"],
      "center": [13.9126, 100.6068],
      "radiusKm": 2
    },
    {
      "id": "UTP",
      "type": "airport",
      "name": {
        "en": "U-Tapao Airport (UTP)",
        "th": "สนามบินอู่ตะเภา (UTP)",
        "zh": "乌塔堡机场 (UTP)"
      },
      "aliases": ["U-Tapao", "U Tapao", "Utapao", "UTP", "Rayong Pattaya Airport", "U-Tapao Rayong Pattaya", "อู่ตะเภา", "สนามบินอู่ตะเภา", "乌塔堡", "乌塔堡机场", "芭提雅机场"],
      "center": [12.6799, 101.005],
      "radiusKm": 3
    },
    {
      "id": "HKT",
      "type": "airport",
      "name": {
        "en": "Phuket Airport (HKT)",
        "th": "สนามบินภูเก็ต (HKT)",
        "zh": "普吉机场 (HKT)"
      },
      "aliases": ["Phuket Airport", "Phuket International Airport", "HKT", "สนามบินภูเก็ต", "ท่าอากาศยานภูเก็ต", "普吉机场", "普吉国际机场"],
      "center": [8.111, 98.3065],
      "radiusKm": 2
    },
    {
      "id": "BKKAREA",
      "type": "bangkok",
      "area": "BKKAREA",
      "name": {
        "en": "Bangkok area",
        "th": "กรุงเทพฯ และปริมณฑล",
        "zh": "曼谷地区"
      }
    },
    {
      "id": "BKKCITY",
      "type": "bangkok",
      "area": "BKKAREA",
      "name": {
        "en": "Bangkok (within Bangkok)",
        "th": "กรุงเทพฯ (ภายในกรุงเทพฯ)",
        "zh": "曼谷（市内）"
      }
    },
    {
      "id": "BKKZ1",
      "type": "bangkok",
      "area": "BKKAREA",
      "name": {
        "en": "Bangkok Zone 1 (hotel)",
        "th": "กรุงเทพฯ โซน 1 (โรงแรม)",
        "zh": "曼谷 1 区（酒店）"
      },
      "aliases": ["Bangkok", "Bangkok Zone 1", "Phra Nakhon", "Bangkok city", "กรุงเทพ", "กรุงเทพมหานคร", "พระนคร", "โซน 1", "曼谷", "曼谷市区", "曼谷1区"],
      "polygons": [
        [
          [13.895, 100.4905],
          [13.8943, 100.4907],
          [13.8892, 100.488],
          [13.8813, 100.4803],
          [13.8755, 100.4768],
          [13.8712, 100.4764],
          [13.8565, 100.4787],
          [13.8533, 100.4806],
          [13.8477, 100.4887],
          [13.8372, 100.4919],
          [13.8273, 100.4988],
          [13.8186, 100.5029],
          [13.8137, 100.5144],
          [13.8114, 100.5166],
          [13.8072, 100.5176],
          [13.8011, 100.5168],
          [13.7959, 100.5143],
          [13.7858, 100.5053],
          [13.769, 100.4972],
          [13.7609, 100.49],
          [13.7571, 100.488],
          [13.7496, 100.4879],
          [13.7436, 100.4909],
          [13.7402, 100.4948],
          [13.7354, 100.5092],
          [13.7306, 100.512],
          [13.7258, 100.5128],
          [13.7183, 100.5118],
          [13.7125, 100.5084],
          [13.7082, 100.5039],
          [13.7014, 100.4926],
          [13.6958, 100.4898],
          [13.6919, 100.4913],
          [13.689, 100.4952],
          [13.6863, 100.502],
          [13.6843, 100.5144],
          [13.6716, 100.5311],
          [13.6691, 100.5392],
          [13.6717, 100.5467],
          [13.6772, 100.5506],
          [13.6862, 100.5525],
          [13.7006, 100.5515],
          [13.7039, 100.5528],
          [13.7056, 100.555],
          [13.7064, 100.5599],
          [13.7042, 100.5679],
          [13.6991, 100.5802],
          [13.6942, 100.5861],
          [13.6869, 100.5892],
          [13.6798, 100.5873],
          [13.6692, 100.5793],
          [13.6604, 100.5705],
          [13.6569, 100.5649],
          [13.6557, 100.5589],
          [13.6563, 100.5547],
          [13.6606, 100.5438],
          [13.6606, 100.5393],
          [13.6558, 100.5351],
          [13.6499, 100.5339],
          [13.6404, 100.5355],
          [13.6304, 100.5402],
          [13.6186, 100.5513],
          [13.6114, 100.5653],
          [13.61, 100.5858],
          [13.6085, 100.5892],
          [13.6054, 100.5915],
          [13.5975, 100.5925],
          [13.5905, 100.5905],
          [13.5723, 100.5779],
          [13.5621, 100.5764],
          [13.5569, 100.578],
          [13.5521, 100.5815],
          [13.5422, 100.5945],
          [13.4, 100.5945],
          [13.4, 101],
          [13.895, 101]
        ]
      ],
      "center": [13.7466, 100.5393]
    },
    {
      "id": "BKKZ2",
      "type": "bangkok",
      "area": "BKKAREA",
      "name": {
        "en": "Bangkok Zone 2 (hotel)",
        "th": "กรุงเทพฯ โซน 2 (โรงแรม)",
        "zh": "曼谷 2 区（酒店）"
      },
      "aliases": ["Bangkok Zone 2", "Thonburi", "Thon Buri", "Bangkok Noi", "Rangsit", "ธนบุรี", "ฝั่งธน", "รังสิต", "โซน 2", "吞武里", "曼谷2区"],
      "polygons": [
        [
          [13.895, 100.2],
          [13.895, 100.4905],
          [13.8943, 100.4907],
          [13.8892, 100.488],
          [13.8813, 100.4803],
          [13.8755, 100.4768],
          [13.8712, 100.4764],
          [13.8565, 100.4787],
          [13.8533, 100.4806],
          [13.8477, 100.4887],
          [13.8372, 100.4919],
          [13.8273, 100.4988],
          [13.8186, 100.5029],
          [13.8137, 100.5144],
          [13.8114, 100.5166],
          [13.8072, 100.5176],
          [13.8011, 100.5168],
          [13.7959, 100.5143],
          [13.7858, 100.5053],
          [13.769, 100.4972],
          [13.7609, 100.49],
          [13.7571, 100.488],
          [13.7496, 100.4879],
          [13.7436, 100.4909],
          [13.7402, 100.4948],
          [13.7354, 100.5092],
          [13.7306, 100.512],
          [13.7258, 100.5128],
          [13.7183, 100.5118],
          [13.7125, 100.5084],
          [13.7082, 100.5039],
          [13.7014, 100.4926],
          [13.6958, 100.4898],
          [13.6919, 100.4913],
          [13.689, 100.4952],
          [13.6863, 100.502],
          [13.6843, 100.5144],
          [13.6716, 100.5311],
          [13.6691, 100.5392],
          [13.6717, 100.5467],
          [13.6772, 100.5506],
          [13.6862, 100.5525],
          [13.7006, 100.5515],
          [13.7039, 100.5528],
          [13.7056, 100.555],
          [13.7064, 100.5599],
          [13.7042, 100.5679],
          [13.6991, 100.5802],
          [13.6942, 100.5861],
          [13.6869, 100.5892],
          [13.6798, 100.5873],
          [13.6692, 100.5793],
          [13.6604, 100.5705],
          [13.6569, 100.5649],
          [13.6557, 100.5589],
          [13.6563, 100.5547],
          [13.6606, 100.5438],
          [13.6606, 100.5393],
          [13.6558, 100.5351],
          [13.6499, 100.5339],
          [13.6404, 100.5355],
          [13.6304, 100.5402],
          [13.6186, 100.5513],
          [13.6114, 100.5653],
          [13.61, 100.5858],
          [13.6085, 100.5892],
          [13.6054, 100.5915],
          [13.5975, 100.5925],
          [13.5905, 100.5905],
          [13.5723, 100.5779],
          [13.5621, 100.5764],
          [13.5569, 100.578],
          [13.5521, 100.5815],
          [13.5422, 100.5945],
          [13.4, 100.5945],
          [13.4, 100.2]
        ],
        [
          [13.895, 100.2],
          [14.1, 100.2],
          [14.1, 101],
          [13.895, 101]
        ]
      ],
      "center": [13.728, 100.48]
    },
    {
      "id": "PATTAYA",
      "type": "pattaya",
      "area": "PATTAYA",
      "name": {
        "en": "Pattaya",
        "th": "พัทยา",
        "zh": "芭提雅"
      }
    },
    {
      "id": "PTYN",
      "type": "pattaya",
      "area": "PATTAYA",
      "reverseAs": "PATTAYA",
      "name": {
        "en": "Pattaya North",
        "th": "พัทยาเหนือ",
        "zh": "芭提雅北部"
      },
      "aliases": ["North Pattaya", "Pattaya North", "Naklua", "Na Kluea", "Wongamat", "Wong Amat", "พัทยาเหนือ", "นาเกลือ", "วงศ์อมาตย์", "北芭提雅", "芭提雅北", "那克鲁亚"],
      "polygons": [
        [
          [12.941, 100.84],
          [13.06, 100.84],
          [13.06, 100.98],
          [12.941, 100.98]
        ]
      ],
      "center": [12.96, 100.89]
    },
    {
      "id": "PTYC",
      "type": "pattaya",
      "area": "PATTAYA",
      "reverseAs": "PATTAYA",
      "name": {
        "en": "Pattaya Central",
        "th": "พัทยากลาง",
        "zh": "芭提雅中部"
      },
      "aliases": ["Central Pattaya", "Pattaya Central", "Pattaya", "Pattaya Beach", "Beach Road Pattaya", "พัทยา", "พัทยากลาง", "芭提雅", "芭提雅中心", "芭提雅中部"],
      "polygons": [
        [
          [12.926, 100.84],
          [12.941, 100.84],
          [12.941, 100.98],
          [12.926, 100.98]
        ]
      ],
      "center": [12.934, 100.884]
    },
    {
      "id": "PTYS",
      "type": "pattaya",
      "area": "PATTAYA",
      "reverseAs": "PATTAYA",
      "name": {
        "en": "Pattaya South",
        "th": "พัทยาใต้",
        "zh": "芭提雅南部"
      },
      "aliases": ["South Pattaya", "Pattaya South", "Walking Street", "Jomtien", "Jomtian", "Pratumnak", "Phra Tamnak", "พัทยาใต้", "จอมเทียน", "พระตำหนัก", "วอล์กกิ้งสตรีท", "南芭提雅", "芭提雅南", "宗甸", "步行街"],
      "polygons": [
        [
          [12.83, 100.84],
          [12.926, 100.84],
          [12.926, 100.98],
          [12.83, 100.98]
        ]
      ],
      "center": [12.905, 100.875]
    },
    {
      "id": "HUAHIN",
      "type": "huahin",
      "name": {
        "en": "Hua Hin",
        "th": "หัวหิน",
        "zh": "华欣"
      },
      "aliases": ["Hua Hin", "Huahin", "Hua-Hin", "หัวหิน", "华欣", "華欣"],
      "center": [12.5699, 99.9573],
      "radiusKm": 18
    },
    {
      "id": "NAIYANG",
      "type": "phuket",
      "name": {
        "en": "Nai Yang Beach",
        "th": "หาดในยาง",
        "zh": "奈扬海滩"
      },
      "aliases": ["Nai Yang", "Naiyang", "ในยาง", "奈扬"],
      "center": [8.09, 98.298],
      "radiusKm": 3
    },
    {
      "id": "NAITHON",
      "type": "phuket",
      "name": {
        "en": "Nai Thon / Bang Tao",
        "th": "ในทอน / บางเทา",
        "zh": "奈通 / 邦涛"
      },
      "aliases": ["Nai Thon", "Naithon", "ในทอน", "奈通"],
      "center": [8.055, 98.278],
      "radiusKm": 3.5
    },
    {
      "id": "BANGRONG",
      "type": "phuket",
      "name": {
        "en": "Bang Rong Pier",
        "th": "ท่าเรือบางโรง",
        "zh": "邦隆码头"
      },
      "aliases": ["Bang Rong", "Bangrong", "Bang Rong Pier", "บางโรง", "ท่าเรือบางโรง", "邦隆码头"],
      "center": [8.0497, 98.416],
      "radiusKm": 4
    },
    {
      "id": "LAGUNA",
      "type": "phuket",
      "name": {
        "en": "Laguna / Bang Tao",
        "th": "ลากูน่า / บางเทา",
        "zh": "乐古浪 / 邦涛"
      },
      "aliases": ["Laguna", "Laguna Phuket", "Bang Tao", "Bangtao", "ลากูน่า", "บางเทา", "乐古浪", "邦涛"],
      "center": [7.998, 98.295],
      "radiusKm": 3.5
    },
    {
      "id": "MAIKHAO",
      "type": "phuket",
      "name": {
        "en": "Mai Khao Beach",
        "th": "หาดไม้ขาว",
        "zh": "迈考海滩"
      },
      "aliases": ["Mai Khao", "Maikhao", "ไม้ขาว", "迈考"],
      "center": [8.16, 98.297],
      "radiusKm": 6
    },
    {
      "id": "AOPO",
      "type": "phuket",
      "name": {
        "en": "Ao Po",
        "th": "อ่าวปอ",
        "zh": "澳波"
      },
      "aliases": ["Ao Po", "Ao Por", "Ao Po Grand Marina", "อ่าวปอ", "奥波"],
      "center": [8.069, 98.445],
      "radiusKm": 4
    },
    {
      "id": "CHALONG",
      "type": "phuket",
      "name": {
        "en": "Chalong",
        "th": "ฉลอง",
        "zh": "查龙"
      },
      "aliases": ["Chalong", "Chalong Pier", "ฉลอง", "查龙", "查龙码头"],
      "center": [7.845, 98.338],
      "radiusKm": 4.5
    },
    {
      "id": "PATONG",
      "type": "phuket",
      "name": {
        "en": "Patong Beach",
        "th": "หาดป่าตอง",
        "zh": "芭东海滩"
      },
      "aliases": ["Patong", "Patong Beach", "Bangla Road", "Bangla", "ป่าตอง", "หาดป่าตอง", "芭东", "芭东海滩", "巴东"],
      "center": [7.895, 98.298],
      "radiusKm": 3.5
    },
    {
      "id": "PKTTOWN",
      "type": "phuket",
      "name": {
        "en": "Phuket Town",
        "th": "เมืองภูเก็ต",
        "zh": "普吉镇"
      },
      "aliases": ["Phuket Town", "Phuket City", "Phuket Old Town", "เมืองภูเก็ต", "ภูเก็ตทาวน์", "普吉镇", "普吉老城"],
      "center": [7.885, 98.39],
      "radiusKm": 5
    },
    {
      "id": "SIRAY",
      "type": "phuket",
      "name": {
        "en": "Siray (Koh Sire)",
        "th": "เกาะสิเหร่",
        "zh": "Siray (Koh Sire)"
      },
      "aliases": ["Siray", "Sire", "Koh Sire", "Ko Sire", "Koh Siray", "สิเหร่", "เกาะสิเหร่", "西瑞岛"],
      "center": [7.886, 98.433],
      "radiusKm": 3
    },
    {
      "id": "KAMALA",
      "type": "phuket",
      "name": {
        "en": "Kamala / Surin",
        "th": "กมลา / สุรินทร์",
        "zh": "卡马拉 / 苏林"
      },
      "aliases": ["Kamala", "Surin", "Surin Beach", "กมลา", "สุรินทร์", "卡马拉", "苏林"],
      "center": [7.96, 98.28],
      "radiusKm": 3.5
    },
    {
      "id": "KATA",
      "type": "phuket",
      "name": {
        "en": "Kata / Karon",
        "th": "กะตะ / กะรน",
        "zh": "卡塔 / 卡伦"
      },
      "aliases": ["Kata", "Karon", "Kata Noi", "Kata Beach", "Karon Beach", "กะตะ", "กะรน", "卡塔", "卡伦"],
      "center": [7.83, 98.299],
      "radiusKm": 3.5
    },
    {
      "id": "PANWA",
      "type": "phuket",
      "name": {
        "en": "Panwa",
        "th": "พันวา",
        "zh": "攀瓦"
      },
      "aliases": ["Panwa", "Cape Panwa", "พันวา", "攀瓦"],
      "center": [7.807, 98.405],
      "radiusKm": 4
    },
    {
      "id": "TRITRANG",
      "type": "phuket",
      "name": {
        "en": "Tri Trang",
        "th": "ไตรตรัง",
        "zh": "Tri Trang 海滩"
      },
      "aliases": ["Tri Trang", "Tritrang", "ไตรตรัง", "特里通"],
      "center": [7.8865, 98.2773],
      "radiusKm": 1.8
    },
    {
      "id": "RAWAI",
      "type": "phuket",
      "name": {
        "en": "Rawai / Nai Harn / Sai Yuan",
        "th": "ราไวย์ / ในหาน / ไสยวน",
        "zh": "拉威 / 奈汉 / 赛远"
      },
      "aliases": ["Rawai", "Nai Harn", "Naiharn", "Sai Yuan", "ราไวย์", "ในหาน", "ไสยวน", "拉威", "奈汉"],
      "center": [7.777, 98.317],
      "radiusKm": 4
    },
    {
      "id": "KHAOLAK",
      "type": "phuket",
      "name": {
        "en": "Khao Lak Centre",
        "th": "เขาหลัก (ตัวเมือง)",
        "zh": "考拉中心"
      },
      "aliases": ["Khao Lak", "Khaolak", "Bang Niang", "Bang Niang Beach", "เขาหลัก", "บางเนียง", "考拉", "蔻立"],
      "center": [8.64, 98.25],
      "radiusKm": 12
    },
    {
      "id": "KHAOLAKJW",
      "type": "phuket",
      "name": {
        "en": "Khao Lak (JW Marriott)",
        "th": "เขาหลัก (JW Marriott)",
        "zh": "考拉（JW 万豪）"
      },
      "aliases": ["JW Marriott Khao Lak", "Khuk Khak", "JW Khao Lak", "เจดับบลิว แมริออท เขาหลัก", "考拉JW万豪"],
      "center": [8.7015, 98.2405],
      "radiusKm": 6
    },
    {
      "id": "PHANGNGA",
      "type": "phuket",
      "name": {
        "en": "Phang Nga",
        "th": "พังงา",
        "zh": "攀牙"
      },
      "aliases": ["Phang Nga", "Phangnga", "Phang-Nga", "พังงา", "攀牙"],
      "center": [8.461, 98.531],
      "radiusKm": 12
    },
    {
      "id": "AONANG",
      "type": "phuket",
      "name": {
        "en": "Ao Nang / Krabi",
        "th": "อ่าวนาง / กระบี่",
        "zh": "奥南 / 甲米"
      },
      "aliases": ["Ao Nang", "Aonang", "Krabi", "Krabi Town", "Railay", "อ่าวนาง", "กระบี่", "甲米", "奥南"],
      "center": [8.05, 98.85],
      "radiusKm": 22
    }
  ],
  "rates": {
    "BKK": {
      "BKKZ1": [550, 650, 750, 750, 1500, 2800],
      "BKKZ2": [700, 800, 850, 850, 1650, 3000],
      "PTYN": [1250, 1350, 1350, 1400, 2100, 6000],
      "PTYC": [1250, 1350, 1350, 1400, 2100, 6000],
      "PTYS": [1250, 1350, 1350, 1400, 2100, 6000],
      "HUAHIN": [1650, 1700, 1750, 1750, 2500, 8500]
    },
    "DMK": {
      "BKK": [850, 950, 1000, 1000, 1700, 3000],
      "BKKAREA": [850, 950, 1000, 1000, 1700, 3000],
      "PTYN": [1350, 1450, 1450, 1450, 2200, 6500],
      "PTYC": [1350, 1450, 1450, 1450, 2200, 6500],
      "PTYS": [1350, 1450, 1450, 1450, 2200, 6500],
      "HUAHIN": [1650, 1700, 1750, 1750, 2500, 8500]
    },
    "BKKAREA": {
      "BKKCITY": [500, 600, 650, 700, 1400, 2500],
      "PTYN": [1250, 1350, 1350, 1400, 2100, 6000],
      "PTYC": [1250, 1350, 1350, 1400, 2100, 6000],
      "PTYS": [1250, 1350, 1350, 1400, 2100, 6000]
    },
    "PATTAYA": {
      "BKK": [1250, 1350, 1350, 1400, 2100, 6000],
      "BKKZ1": [1450, 1550, 1550, 1600, 2500, 6500],
      "BKKZ2": [1550, 1650, 1650, 1750, 2650, 7000],
      "DMK": [1550, 1650, 1650, 1750, 2650, 7000]
    },
    "UTP": {
      "BKKAREA": [1550, 1650, null, null, 2400, null],
      "PTYN": [850, 950, null, null, 1500, null],
      "PTYC": [850, 950, null, null, 1500, null],
      "PTYS": [850, 950, null, null, 1500, null]
    },
    "HKT": {
      "NAIYANG": [590, 720, 720, null, 840, null],
      "NAITHON": [720, 970, 970, null, 1090, null],
      "BANGRONG": [840, 970, 970, null, 1220, null],
      "LAGUNA": [970, 1090, 1090, null, 1340, null],
      "MAIKHAO": [970, 1090, 1090, null, 1340, null],
      "AOPO": [840, 1090, 1090, null, 1220, null],
      "CHALONG": [1090, 1220, 1220, null, 1470, null],
      "PATONG": [1090, 1220, 1220, null, 1470, null],
      "PKTTOWN": [970, 1090, 1090, null, 1340, null],
      "SIRAY": [970, 1220, 1220, null, 1470, null],
      "KAMALA": [970, 1090, 1090, null, 1220, null],
      "KATA": [1090, 1220, 1220, null, 1470, null],
      "PANWA": [1090, 1220, 1220, null, 1470, null],
      "TRITRANG": [1220, 1340, 1340, null, 1720, null],
      "RAWAI": [1220, 1340, 1340, null, 1720, null],
      "KHAOLAK": [1840, 2090, 2090, null, 2340, null],
      "KHAOLAKJW": [2090, 2470, 2470, null, 2720, null],
      "PHANGNGA": [2090, 2340, 2340, null, 2720, null],
      "AONANG": [2470, 2720, 2720, null, 3340, null]
    }
  },
  "charter": [
    {
      "id": "bangkok",
      "perHour": [400, 500, 600, null, 650, 800],
      "minHours": 4,
      "fuelIncluded": true
    },
    {
      "id": "outside",
      "perHour": [450, 550, 650, null, 700, 850],
      "minHours": 6,
      "fuelIncluded": false
    }
  ],
  "places": [
    {
      "name": {
        "en": "Siam Paragon",
        "th": "สยามพารากอน",
        "zh": "暹罗百丽宫"
      },
      "aliases": ["Paragon", "Siam"],
      "at": [13.7468, 100.535]
    },
    {
      "name": {
        "en": "ICONSIAM",
        "th": "ไอคอนสยาม",
        "zh": "暹罗天地"
      },
      "aliases": ["Icon Siam"],
      "at": [13.7268, 100.5103]
    },
    {
      "name": {
        "en": "CentralWorld",
        "th": "เซ็นทรัลเวิลด์",
        "zh": "中央世界"
      },
      "aliases": ["Central World"],
      "at": [13.7466, 100.5393]
    },
    {
      "name": {
        "en": "MBK Center",
        "th": "เอ็ม บี เค เซ็นเตอร์",
        "zh": "MBK购物中心"
      },
      "aliases": ["MBK", "Mahboonkrong"],
      "at": [13.7445, 100.53]
    },
    {
      "name": {
        "en": "Pratunam",
        "th": "ประตูน้ำ",
        "zh": "水门市场"
      },
      "aliases": ["Platinum Mall"],
      "at": [13.7505, 100.5398]
    },
    {
      "name": {
        "en": "Khao San Road",
        "th": "ถนนข้าวสาร",
        "zh": "考山路"
      },
      "aliases": ["Khaosan", "Khao San"],
      "at": [13.7589, 100.4973]
    },
    {
      "name": {
        "en": "Grand Palace",
        "th": "พระบรมมหาราชวัง",
        "zh": "大皇宫"
      },
      "aliases": ["Wat Phra Kaew", "วัดพระแก้ว"],
      "at": [13.75, 100.4913]
    },
    {
      "name": {
        "en": "Wat Arun",
        "th": "วัดอรุณ",
        "zh": "郑王庙"
      },
      "aliases": ["Temple of Dawn"],
      "at": [13.7437, 100.4889]
    },
    {
      "name": {
        "en": "Asiatique The Riverfront",
        "th": "เอเชียทีค",
        "zh": "河滨夜市"
      },
      "aliases": ["Asiatique"],
      "at": [13.7042, 100.5027]
    },
    {
      "name": {
        "en": "Chinatown (Yaowarat)",
        "th": "เยาวราช",
        "zh": "唐人街"
      },
      "aliases": ["Yaowarat", "Chinatown"],
      "at": [13.74, 100.51]
    },
    {
      "name": {
        "en": "Sukhumvit (Nana)",
        "th": "สุขุมวิท นานา",
        "zh": "素坤逸 娜娜"
      },
      "aliases": ["Nana", "Sukhumvit"],
      "at": [13.7406, 100.555]
    },
    {
      "name": {
        "en": "Asok / Terminal 21",
        "th": "อโศก / เทอร์มินอล 21",
        "zh": "阿索克 / Terminal 21"
      },
      "aliases": ["Asoke", "Terminal 21 Bangkok"],
      "at": [13.7377, 100.5604]
    },
    {
      "name": {
        "en": "Thong Lo",
        "th": "ทองหล่อ",
        "zh": "通罗"
      },
      "aliases": ["Thonglor", "Thong Lor"],
      "at": [13.7246, 100.5785]
    },
    {
      "name": {
        "en": "Silom",
        "th": "สีลม",
        "zh": "是隆"
      },
      "aliases": ["Sala Daeng", "Patpong"],
      "at": [13.729, 100.534]
    },
    {
      "name": {
        "en": "Chatuchak Weekend Market",
        "th": "ตลาดนัดจตุจักร",
        "zh": "乍都乍周末市场"
      },
      "aliases": ["Chatuchak", "JJ Market"],
      "at": [13.7999, 100.5503]
    },
    {
      "name": {
        "en": "Siriraj Hospital",
        "th": "โรงพยาบาลศิริราช",
        "zh": "诗里拉医院"
      },
      "aliases": ["Siriraj"],
      "at": [13.759, 100.4853]
    },
    {
      "name": {
        "en": "Terminal 21 Pattaya",
        "th": "เทอร์มินอล 21 พัทยา",
        "zh": "芭提雅 Terminal 21"
      },
      "aliases": [],
      "at": [12.9499, 100.8898]
    },
    {
      "name": {
        "en": "Central Festival Pattaya Beach",
        "th": "เซ็นทรัล พัทยา",
        "zh": "芭提雅中央节日购物中心"
      },
      "aliases": ["Central Pattaya"],
      "at": [12.9342, 100.8841]
    },
    {
      "name": {
        "en": "Walking Street Pattaya",
        "th": "วอล์กกิ้งสตรีท พัทยา",
        "zh": "芭提雅步行街"
      },
      "aliases": [],
      "at": [12.9205, 100.8715]
    },
    {
      "name": {
        "en": "Sanctuary of Truth",
        "th": "ปราสาทสัจธรรม",
        "zh": "真理寺"
      },
      "aliases": [],
      "at": [12.9727, 100.8892]
    },
    {
      "name": {
        "en": "Bangla Road, Patong",
        "th": "ถนนบางลา ป่าตอง",
        "zh": "芭东酒吧街"
      },
      "aliases": ["Bangla"],
      "at": [7.8935, 98.2976]
    },
    {
      "name": {
        "en": "Phuket Old Town",
        "th": "เมืองเก่าภูเก็ต",
        "zh": "普吉老城"
      },
      "aliases": [],
      "at": [7.8848, 98.3892]
    },
    {
      "name": {
        "en": "Central Phuket",
        "th": "เซ็นทรัล ภูเก็ต",
        "zh": "普吉中央购物中心"
      },
      "aliases": ["Central Festival Phuket"],
      "at": [7.8913, 98.368]
    },
    {
      "name": {
        "en": "Big Buddha Phuket",
        "th": "พระใหญ่ภูเก็ต",
        "zh": "普吉大佛"
      },
      "aliases": ["Big Buddha"],
      "at": [7.8278, 98.3128]
    }
  ]
};
